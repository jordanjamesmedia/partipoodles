import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import sharp from "sharp";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// The object storage client is used to interact with the object storage service.
export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// The object storage service is used to interact with the object storage service.
export class ObjectStorageService {
  constructor() {}

  // Gets the public object search paths.
  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  // Search for a public object from the search paths.
  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      // Full path format: /<bucket_name>/<object_name>
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      // Check if file exists
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  // Downloads an object to the response with optional image compression.
  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600, options?: {
    compress?: boolean;
    quality?: number;
    width?: number;
    height?: number;
  }, req?: any) {
    try {
      // Get file metadata
      const [metadata] = await file.getMetadata();
      // Get the ACL policy for the object.
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      
      const contentType = metadata.contentType || "application/octet-stream";
      const isImage = contentType.startsWith("image/");
      const shouldCompress = options?.compress !== false && isImage;
      
      // Set aggressive caching headers for better performance
      const cacheHeaders = {
        "Cache-Control": `${
          isPublic ? "public" : "private"
        }, max-age=${cacheTtlSec}, immutable`,
        "ETag": metadata.etag || `"${metadata.md5Hash}"`,
        "Last-Modified": metadata.updated || metadata.timeCreated,
      };
      
      // Check if client has cached version (only if req is provided)
      if (req) {
        const clientETag = req.headers['if-none-match'];
        const clientModified = req.headers['if-modified-since'];
        
        if (clientETag === cacheHeaders.ETag || 
            (clientModified && cacheHeaders["Last-Modified"] && 
             new Date(clientModified) >= new Date(cacheHeaders["Last-Modified"]))) {
          res.status(304);
          Object.entries(cacheHeaders).forEach(([key, value]) => {
            res.set(key, value);
          });
          return res.end();
        }
      }
      
      if (shouldCompress) {
        try {
          // Download the file to a buffer first
          const [buffer] = await file.download();
          
          // Apply optimized image compression with sharp
          // Check for EXIF data and create Sharp instance with explicit rotation
          const metadata = await sharp(buffer).metadata();
          let sharpInstance = sharp(buffer);
          
          // Handle orientation explicitly to fix upside down/sideways images
          if (metadata.orientation) {
            switch (metadata.orientation) {
              case 2:
                sharpInstance = sharpInstance.flop(); // flip horizontal
                break;
              case 3:
                sharpInstance = sharpInstance.rotate(180); // rotate 180°
                break;
              case 4:
                sharpInstance = sharpInstance.flip(); // flip vertical
                break;
              case 5:
                sharpInstance = sharpInstance.rotate(90).flop(); // rotate 90° + flip horizontal
                break;
              case 6:
                sharpInstance = sharpInstance.rotate(90); // rotate 90° clockwise
                break;
              case 7:
                sharpInstance = sharpInstance.rotate(270).flop(); // rotate 270° + flip horizontal
                break;
              case 8:
                sharpInstance = sharpInstance.rotate(270); // rotate 270° (or 90° counter-clockwise)
                break;
              default:
                // orientation 1 or undefined = no rotation needed
                break;
            }
            
            // Remove EXIF orientation data after applying transforms to prevent client-side double-rotation
            sharpInstance = sharpInstance.withMetadata({
              orientation: 1 // Set to normal orientation after server processing
            });
          }
          
          // Apply resize if specified with optimized settings
          if (options?.width || options?.height) {
            sharpInstance = sharpInstance.resize(options.width, options.height, {
              fit: 'inside',
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3 // Better quality for thumbnails
            });
          }
          
          // Apply aggressive quality compression for faster loading
          const quality = options?.quality || 75; // Reduced from 80 for better performance
          
          if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            sharpInstance = sharpInstance.jpeg({ 
              quality,
              progressive: true,
              mozjpeg: true // Better compression
            });
          } else if (contentType.includes('png')) {
            sharpInstance = sharpInstance.png({ 
              compressionLevel: 8, // Increased compression
              progressive: true,
              palette: (options?.width && options.width < 400) ? true : undefined // Use palette for small images
            });
          } else if (contentType.includes('webp')) {
            sharpInstance = sharpInstance.webp({ 
              quality,
              effort: 4 // Balance between compression and speed
            });
          }
          
          const compressedBuffer = await sharpInstance.toBuffer();
          
          // Set headers for compressed image with caching
          res.set({
            "Content-Type": contentType,
            "Content-Length": compressedBuffer.length.toString(),
            "X-Compressed": "true",
            "X-Original-Size": buffer.length.toString(),
            "X-Compression-Ratio": ((1 - (compressedBuffer.length / buffer.length)) * 100).toFixed(1) + "%",
            "X-Orientation-Fixed": metadata.orientation ? `${metadata.orientation}->1` : "none",
            ...cacheHeaders
          });
          
          res.send(compressedBuffer);
          return;
        } catch (compressionError) {
          console.error("Image compression failed, falling back to original:", compressionError);
          // Fall through to original streaming logic
        }
      }
      
      // Original streaming logic for non-images or when compression fails
      res.set({
        "Content-Type": contentType,
        "Content-Length": metadata.size,
        ...cacheHeaders
      });

      // Stream the file to the response
      const stream = file.createReadStream();

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    // Sign URL for PUT method with TTL
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    
    try {
      const [exists] = await objectFile.exists();
      if (!exists) {
        console.log(`Object not found: ${objectEntityPath}`);
        throw new ObjectNotFoundError();
      }
      return objectFile;
    } catch (error) {
      console.log(`Error checking object existence: ${error}`);
      throw new ObjectNotFoundError();
    }
  }

  normalizeObjectEntityPath(
    rawPath: string,
  ): string {
    console.log('Normalizing path:', rawPath);
    
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      console.log('Not a GCS URL, returning as is');
      return rawPath;
    }
  
    // Extract the path from the URL by removing query parameters and domain
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    console.log('Raw object path from URL:', rawObjectPath);
  
    // Handle both direct .private paths and bucket-prefixed paths
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    console.log('Private object dir:', objectEntityDir);
  
    // Check if the path contains uploads directory
    if (rawObjectPath.includes('/.private/uploads/')) {
      const fileName = rawObjectPath.split('/.private/uploads/')[1];
      const normalizedPath = `/objects/uploads/${fileName}`;
      console.log('Normalized path from .private/uploads:', normalizedPath);
      return normalizedPath;
    }
  
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      console.log('Path does not start with private dir, checking for direct uploads');
      // Check if it's just a direct upload path
      if (rawObjectPath.includes('/uploads/')) {
        const parts = rawObjectPath.split('/uploads/');
        if (parts.length > 1) {
          const fileName = parts[1];
          const normalizedPath = `/objects/uploads/${fileName}`;
          console.log('Normalized path from direct uploads:', normalizedPath);
          return normalizedPath;
        }
      }
      console.log('Path does not match expected format, returning as is');
      return rawObjectPath;
    }
  
    // Extract the entity ID from the path
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    const normalizedPath = `/objects/${entityId}`;
    console.log('Normalized path:', normalizedPath);
    return normalizedPath;
  }

  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}