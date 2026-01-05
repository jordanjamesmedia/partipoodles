import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { sendInquiryNotification } from "./twilioService";
import { insertPuppySchema, insertInquirySchema, insertCustomerSchema, insertGalleryPhotoSchema, insertParentDogSchema, insertLitterSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Enhanced admin login endpoint with database authentication
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
      // Check if admin user exists in database
      const adminUser = await storage.getAdminUserByUsername(username);
      
      if (adminUser && adminUser.password === password && adminUser.isActive) {
        // Update last login time
        await storage.updateLastLogin(adminUser.id);
        
        // Set session
        const session = req.session as any;
        session.adminLoggedIn = true;
        session.adminUser = { 
          id: adminUser.id,
          username: adminUser.username, 
          role: adminUser.role,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          profileImageUrl: adminUser.profileImageUrl
        };
        
        res.json({ 
          success: true, 
          message: 'Login successful',
          user: session.adminUser
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials or account is disabled'
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed' 
      });
    }
  });

  // Admin logout endpoint
  app.post('/api/admin/logout', async (req, res) => {
    (req as any).session.adminLoggedIn = false;
    (req as any).session.adminUser = null;
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Admin auth check endpoint
  app.get('/api/admin/auth', async (req, res) => {
    const isAdminLoggedIn = (req as any).session?.adminLoggedIn === true;
    if (isAdminLoggedIn) {
      res.json({ 
        authenticated: true, 
        user: (req as any).session.adminUser 
      });
    } else {
      res.status(401).json({ 
        authenticated: false, 
        message: 'Not authenticated' 
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public puppy routes
  app.get("/api/puppies", async (req, res) => {
    try {
      const puppies = await storage.getAvailablePuppies();
      res.json(puppies);
    } catch (error) {
      console.error("Error fetching puppies:", error);
      res.status(500).json({ message: "Failed to fetch puppies" });
    }
  });

  app.get("/api/puppies/:id", async (req, res) => {
    try {
      const puppy = await storage.getPuppy(req.params.id);
      if (!puppy) {
        return res.status(404).json({ message: "Puppy not found" });
      }
      res.json(puppy);
    } catch (error) {
      console.error("Error fetching puppy:", error);
      res.status(500).json({ message: "Failed to fetch puppy" });
    }
  });

  // Public inquiry submission
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiry = insertInquirySchema.parse(req.body);
      const newInquiry = await storage.createInquiry(inquiry);
      
      // Try to create or update customer record
      try {
        const existingCustomer = await storage.getCustomerByEmail(inquiry.email);
        if (!existingCustomer) {
          await storage.createCustomer({
            name: inquiry.customerName,
            email: inquiry.email,
            phone: inquiry.phone || undefined,
            lastContactDate: new Date(),
          });
        } else {
          await storage.updateCustomer(existingCustomer.id, {
            lastContactDate: new Date(),
          });
        }
      } catch (customerError) {
        console.error("Error updating customer record:", customerError);
      }

      // Send SMS notification to Sally
      try {
        await sendInquiryNotification({
          customerName: inquiry.customerName,
          email: inquiry.email,
          phone: inquiry.phone || undefined,
          message: inquiry.message,
          puppyInterest: inquiry.puppyInterest || undefined,
        });
      } catch (smsError) {
        console.error("Error sending SMS notification:", smsError);
        // Don't fail the request if SMS fails
      }

      res.status(201).json(newInquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(400).json({ message: "Invalid inquiry data" });
    }
  });

  // Admin authentication middleware
  const requireAdminAuth = (req: any, res: any, next: any) => {
    if (req.session?.adminLoggedIn === true) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Middleware to check superadmin authentication
  const requireSuperAdminAuth = (req: any, res: any, next: any) => {
    const isAdminLoggedIn = req.session?.adminLoggedIn === true;
    const session = req.session as any;
    const userRole = session?.adminUser?.role;
    if (!isAdminLoggedIn || userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden - Super admin access required' });
    }
    next();
  };

  // Admin profile management routes
  app.get("/api/admin/profile", requireAdminAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const adminUser = session?.adminUser;
      if (!adminUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fullAdminData = await storage.getAdminUser(adminUser.id);
      if (!fullAdminData) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      // Return profile without password
      const { password, ...profile } = fullAdminData;
      res.json(profile);
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/admin/profile", requireAdminAuth, async (req, res) => {
    try {
      const session = req.session as any;
      const adminUser = session?.adminUser;
      if (!adminUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { firstName, lastName, email, profileImageUrl } = req.body;
      const updatedAdmin = await storage.updateAdminProfile(adminUser.id, {
        firstName,
        lastName,
        email,
        profileImageUrl
      });
      
      // Update session data
      session.adminUser = {
        ...session.adminUser,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
        profileImageUrl: updatedAdmin.profileImageUrl
      };
      
      // Return profile without password
      const { password, ...profile } = updatedAdmin;
      res.json(profile);
    } catch (error) {
      console.error("Error updating admin profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin protected routes
  app.get("/api/admin/statistics", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin puppy management
  app.get("/api/admin/puppies", requireAdminAuth, async (req, res) => {
    try {
      const puppies = await storage.getAllPuppies();
      res.json(puppies);
    } catch (error) {
      console.error("Error fetching admin puppies:", error);
      res.status(500).json({ message: "Failed to fetch puppies" });
    }
  });

  app.post("/api/admin/puppies", requireAdminAuth, async (req, res) => {
    try {
      const puppy = insertPuppySchema.parse(req.body);
      const newPuppy = await storage.createPuppy(puppy);
      res.status(201).json(newPuppy);
    } catch (error) {
      console.error("Error creating puppy:", error);
      res.status(400).json({ message: "Invalid puppy data" });
    }
  });

  app.put("/api/admin/puppies/:id", requireAdminAuth, async (req, res) => {
    try {
      const puppy = insertPuppySchema.partial().parse(req.body);
      const updatedPuppy = await storage.updatePuppy(req.params.id, puppy);
      res.json(updatedPuppy);
    } catch (error) {
      console.error("Error updating puppy:", error);
      res.status(400).json({ message: "Invalid puppy data" });
    }
  });

  app.delete("/api/admin/puppies/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deletePuppy(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting puppy:", error);
      res.status(500).json({ message: "Failed to delete puppy" });
    }
  });

  // Admin inquiry management
  app.get("/api/admin/inquiries", requireAdminAuth, async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/admin/inquiries/:id", requireAdminAuth, async (req, res) => {
    try {
      const updatedInquiry = await storage.updateInquiry(req.params.id, req.body);
      res.json(updatedInquiry);
    } catch (error) {
      console.error("Error updating inquiry:", error);
      res.status(400).json({ message: "Failed to update inquiry" });
    }
  });

  app.delete("/api/admin/inquiries/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteInquiry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });

  // Admin customer management
  app.get("/api/admin/customers", requireAdminAuth, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/admin/customers", requireAdminAuth, async (req, res) => {
    try {
      const customer = insertCustomerSchema.parse(req.body);
      const newCustomer = await storage.createCustomer(customer);
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.put("/api/admin/customers/:id", requireAdminAuth, async (req, res) => {
    try {
      const customer = insertCustomerSchema.partial().parse(req.body);
      const updatedCustomer = await storage.updateCustomer(req.params.id, customer);
      res.json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.delete("/api/admin/customers/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Parent dogs routes  
  app.get("/api/parent-dogs", async (req, res) => {
    try {
      const parentDogs = await storage.getActiveParentDogs();
      res.json(parentDogs);
    } catch (error) {
      console.error("Error fetching parent dogs:", error);
      res.status(500).json({ error: "Failed to fetch parent dogs" });
    }
  });

  // Admin parent dog management
  app.get("/api/admin/parent-dogs", requireAdminAuth, async (req, res) => {
    try {
      const parentDogs = await storage.getAllParentDogs();
      res.json(parentDogs);
    } catch (error) {
      console.error("Error fetching parent dogs:", error);
      res.status(500).json({ message: "Failed to fetch parent dogs" });
    }
  });

  app.post("/api/admin/parent-dogs", requireAdminAuth, async (req, res) => {
    try {
      const parentDog = insertParentDogSchema.parse(req.body);
      const newParentDog = await storage.createParentDog(parentDog);
      res.status(201).json(newParentDog);
    } catch (error) {
      console.error("Error creating parent dog:", error);
      res.status(400).json({ message: "Invalid parent dog data" });
    }
  });

  app.put("/api/admin/parent-dogs/:id", requireAdminAuth, async (req, res) => {
    try {
      const parentDog = insertParentDogSchema.partial().parse(req.body);
      const updatedParentDog = await storage.updateParentDog(req.params.id, parentDog);
      res.json(updatedParentDog);
    } catch (error) {
      console.error("Error updating parent dog:", error);
      res.status(400).json({ message: "Invalid parent dog data" });
    }
  });

  app.delete("/api/admin/parent-dogs/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteParentDog(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting parent dog:", error);
      res.status(500).json({ message: "Failed to delete parent dog" });
    }
  });

  // Litter routes  
  app.get("/api/litters", async (req, res) => {
    try {
      const litters = await storage.getActiveLitters();
      res.json(litters);
    } catch (error) {
      console.error("Error fetching litters:", error);
      res.status(500).json({ error: "Failed to fetch litters" });
    }
  });

  // Admin litter management
  app.get("/api/admin/litters", requireAdminAuth, async (req, res) => {
    try {
      const litters = await storage.getAllLitters();
      res.json(litters);
    } catch (error) {
      console.error("Error fetching litters:", error);
      res.status(500).json({ message: "Failed to fetch litters" });
    }
  });

  app.post("/api/admin/litters", requireAdminAuth, async (req, res) => {
    try {
      const litter = insertLitterSchema.parse(req.body);
      const newLitter = await storage.createLitter(litter);
      res.status(201).json(newLitter);
    } catch (error) {
      console.error("Error creating litter:", error);
      res.status(400).json({ message: "Invalid litter data" });
    }
  });

  app.put("/api/admin/litters/:id", requireAdminAuth, async (req, res) => {
    try {
      const litter = insertLitterSchema.partial().parse(req.body);
      const updatedLitter = await storage.updateLitter(req.params.id, litter);
      res.json(updatedLitter);
    } catch (error) {
      console.error("Error updating litter:", error);
      res.status(400).json({ message: "Invalid litter data" });
    }
  });

  app.delete("/api/admin/litters/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteLitter(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting litter:", error);
      res.status(500).json({ message: "Failed to delete litter" });
    }
  });

  // Public gallery for visitors
  app.get("/api/gallery", async (req, res) => {
    try {
      const photos = await storage.getPublicGalleryPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching public gallery photos:", error);
      res.status(500).json({ message: "Failed to fetch gallery photos" });
    }
  });

  // Gallery photo management
  app.get("/api/admin/gallery", requireAdminAuth, async (req, res) => {
    try {
      const photos = await storage.getAllGalleryPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      res.status(500).json({ message: "Failed to fetch gallery photos" });
    }
  });

  app.post("/api/admin/gallery", requireAdminAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const photoData = insertGalleryPhotoSchema.parse({
        ...req.body,
        uploadedBy: userId,
      });
      const newPhoto = await storage.createGalleryPhoto(photoData);
      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error creating gallery photo:", error);
      res.status(400).json({ message: "Invalid photo data" });
    }
  });

  app.put("/api/admin/gallery/:id", requireAdminAuth, async (req, res) => {
    try {
      const updates = req.body;
      const updatedPhoto = await storage.updateGalleryPhoto(req.params.id, updates);
      res.json(updatedPhoto);
    } catch (error) {
      console.error("Error updating gallery photo:", error);
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteGalleryPhoto(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gallery photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Object storage routes for protected file uploading
  app.get("/objects/:objectPath(*)", requireAdminAuth, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res, 3600, {}, req);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAdminAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Public upload endpoint for gallery submissions
  app.post("/api/public/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting public upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/gallery-photos", requireAdminAuth, async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    const userId = (req.user as any)?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting gallery photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Parent dog photo upload endpoint
  app.put("/api/admin/parent-dogs/:id/photos", requireAdminAuth, async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    const parentDogId = req.params.id;
    const userId = (req.user as any)?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      // Update parent dog with new photo
      await storage.addParentDogPhoto(parentDogId, objectPath);

      res.status(200).json({
        objectPath: objectPath,
        message: "Parent dog photo uploaded successfully"
      });
    } catch (error) {
      console.error("Error setting parent dog photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public endpoint for submitting gallery photos
  app.put("/api/public/gallery-photos", async (req, res) => {
    if (!req.body.photoURL || !req.body.name || !req.body.email) {
      return res.status(400).json({ error: "photoURL, name, and email are required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.photoURL,
      );

      // Create gallery photo entry with parent information and new age/photo type fields
      const galleryPhoto = await storage.createGalleryPhoto({
        filename: `photo-${Date.now()}`,
        url: objectPath,
        caption: req.body.caption || `Photo by ${req.body.name}`,
        uploadedBy: null, // No user ID for public uploads
        uploaderName: req.body.name,
        uploaderEmail: req.body.email,
        puppyName: req.body.puppyName,
        parentDam: req.body.parentDam,
        parentSire: req.body.parentSire,
        ageDescription: req.body.ageDescription,
        photoType: req.body.photoType || "single",
        relatedPhotoId: req.body.relatedPhotoId,
        isPublic: false, // Photos need admin approval
      });

      res.status(200).json({
        objectPath: objectPath,
        photo: galleryPhoto,
        message: "Photo uploaded successfully! It will be reviewed by our team before appearing in the gallery."
      });
    } catch (error) {
      console.error("Error creating gallery photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public object serving endpoint for uploads with compression support
  app.get("/public-objects/uploads/:fileName", async (req, res) => {
    const fileName = req.params.fileName;
    const objectStorageService = new ObjectStorageService();
    
    // Parse compression options from query parameters
    const compressionOptions = {
      compress: req.query.compress !== 'false', // Default to true unless explicitly false
      quality: req.query.quality ? parseInt(req.query.quality as string) : 80,
      width: req.query.width ? parseInt(req.query.width as string) : undefined,
      height: req.query.height ? parseInt(req.query.height as string) : undefined,
    };
    
    // Validate compression options
    if (compressionOptions.quality < 1 || compressionOptions.quality > 100) {
      compressionOptions.quality = 80;
    }
    if (compressionOptions.width && compressionOptions.width < 1) {
      compressionOptions.width = undefined;
    }
    if (compressionOptions.height && compressionOptions.height < 1) {
      compressionOptions.height = undefined;
    }
    
    try {
      // First try to search for the file in public objects
      const file = await objectStorageService.searchPublicObject(`uploads/${fileName}`);
      if (file) {
        return objectStorageService.downloadObject(file, res, 3600, compressionOptions, req);
      }
      
      // If not found in public objects, try to serve from private uploads
      try {
        const privateFile = await objectStorageService.getObjectEntityFile(`/objects/uploads/${fileName}`);
        if (privateFile) {
          return objectStorageService.downloadObject(privateFile, res, 3600, compressionOptions, req);
        }
      } catch (privateError) {
        console.log("File not found in private uploads:", privateError);
      }
      
      return res.status(404).json({ error: "File not found" });
    } catch (error) {
      console.error("Error serving public object:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fallback public object serving endpoint for any path with compression support
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    
    // Parse compression options from query parameters
    const compressionOptions = {
      compress: req.query.compress !== 'false', // Default to true unless explicitly false
      quality: req.query.quality ? parseInt(req.query.quality as string) : 80,
      width: req.query.width ? parseInt(req.query.width as string) : undefined,
      height: req.query.height ? parseInt(req.query.height as string) : undefined,
    };
    
    // Validate compression options
    if (compressionOptions.quality < 1 || compressionOptions.quality > 100) {
      compressionOptions.quality = 80;
    }
    if (compressionOptions.width && compressionOptions.width < 1) {
      compressionOptions.width = undefined;
    }
    if (compressionOptions.height && compressionOptions.height < 1) {
      compressionOptions.height = undefined;
    }
    
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res, 3600, compressionOptions);
    } catch (error) {
      console.error("Error searching for public object:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
