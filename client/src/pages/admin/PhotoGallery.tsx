import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Eye, Trash2, Globe, Lock, ToggleLeft, ToggleRight } from "lucide-react";
import OrientationFixedImage from "@/components/OrientationFixedImage";
import type { Id } from "../../../../convex/_generated/dataModel";

// Photo type for Convex data
interface ConvexGalleryPhoto {
  _id: Id<"gallery_photos">;
  url: string;
  imageUrl?: string;
  caption?: string | null;
  filename: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get the best available image URL
function getImageUrl(photo: ConvexGalleryPhoto): string {
  return photo.imageUrl || photo.url;
}

// Convert storage URL to serving endpoint (for Convex URLs, just return as-is)
function convertToPublicUrl(storageUrl: string, options?: {
  quality?: number;
  width?: number;
  height?: number;
  compress?: boolean;
}) {
  // If it's already a full URL (from Convex storage), use it directly
  if (storageUrl.startsWith('https://')) {
    return storageUrl;
  }

  let publicUrl = storageUrl;

  // Handle /objects/uploads/ URLs by converting to public serving endpoint
  if (storageUrl.startsWith('/objects/uploads/')) {
    publicUrl = storageUrl.replace('/objects/uploads/', '/public-objects/uploads/');
  } else if (storageUrl.includes('storage.googleapis.com')) {
    // Extract the object path from the Google Cloud Storage URL
    const matches = storageUrl.match(/\/\.private\/uploads\/([^?]+)/);
    if (matches) {
      publicUrl = `/public-objects/uploads/${matches[1]}`;
    }
  }

  // Add compression parameters for fast loading (only for local endpoints)
  const params = new URLSearchParams();

  if (options?.compress !== false) {
    params.append('compress', 'true');
  }
  if (options?.quality) {
    params.append('quality', options.quality.toString());
  }
  if (options?.width) {
    params.append('width', options.width.toString());
  }
  if (options?.height) {
    params.append('height', options.height.toString());
  }

  // Add cache-busting parameter to force fresh orientation processing
  params.append('v', '20250825-orientation-fix');

  if (params.toString()) {
    publicUrl += `?${params.toString()}`;
  }

  return publicUrl;
}

export default function PhotoGallery() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<ConvexGalleryPhoto | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin-login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch all photos from Convex
  const allPhotos = useQuery(api.galleryPhotos.list) ?? [];
  const photosLoading = allPhotos === undefined;

  // Convex mutations
  const updatePhoto = useMutation(api.galleryPhotos.update);
  const deletePhoto = useMutation(api.galleryPhotos.remove);

  // Filter photos based on publication status
  const photos = allPhotos.filter((photo: ConvexGalleryPhoto) => {
    if (statusFilter === "public") return photo.is_public === true;
    if (statusFilter === "private") return photo.is_public !== true;
    return true; // "all"
  });

  const publicCount = allPhotos.filter((p: ConvexGalleryPhoto) => p.is_public === true).length;
  const privateCount = allPhotos.filter((p: ConvexGalleryPhoto) => p.is_public !== true).length;

  const handleDelete = async (id: Id<"gallery_photos">) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        await deletePhoto({ id });
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete photo",
          variant: "destructive",
        });
      }
    }
  };

  const handleTogglePublic = async (id: Id<"gallery_photos">, currentIsPublic: boolean) => {
    try {
      await updatePhoto({ id, is_public: !currentIsPublic });
      toast({
        title: "Success",
        description: `Photo is now ${!currentIsPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update photo visibility",
        variant: "destructive",
      });
    }
  };

  const handleViewPhoto = (photo: ConvexGalleryPhoto) => {
    setSelectedPhoto(photo);
    setIsViewOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800" data-testid="text-gallery-title">Puppy Portal - Photo Gallery</h1>
              <p className="text-gray-600 mt-1">
                {publicCount} public • {privateCount} private • {allPhotos.length} total
              </p>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="button-upload-photos">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md z-[100]" style={{ zIndex: 100 }}>
                <DialogHeader>
                  <DialogTitle>Upload New Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Photo upload via admin is being migrated. Please use the public gallery upload form at{" "}
                    <a href="/gallery" className="text-primary underline">/gallery</a> for now.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gallery Photos</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter" className="text-sm font-medium">Filter:</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32" id="status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Photos</SelectItem>
                        <SelectItem value="public">Public Only</SelectItem>
                        <SelectItem value="private">Private Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {photosLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="relative">
                      <Skeleton className="w-full h-32 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {photos.map((photo: ConvexGalleryPhoto) => {
                    return (
                      <div key={photo._id} className="relative group">
                        <OrientationFixedImage
                          src={convertToPublicUrl(getImageUrl(photo), { width: 200, quality: 70, compress: true })}
                          alt={photo.caption || photo.filename}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => handleViewPhoto(photo)}
                          data-testid={`img-gallery-${photo._id}`}
                        />

                        {/* Public/Private Status Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                          photo.is_public
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-black'
                        }`}>
                          {photo.is_public ? (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <span>Live</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              <span>Private</span>
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleViewPhoto(photo)}
                              data-testid={`button-view-${photo._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={photo.is_public ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleTogglePublic(photo._id, photo.is_public ?? false)}
                              data-testid={`button-toggle-${photo._id}`}
                              title={photo.is_public ? "Make Private" : "Make Public"}
                            >
                              {photo.is_public ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(photo._id)}
                              data-testid={`button-delete-photo-${photo._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {photo.caption && (
                          <p className="text-xs text-gray-600 mt-1 truncate" title={photo.caption}>
                            {photo.caption}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No photos in gallery</p>
                  <p className="text-sm text-gray-400">
                    Upload photos via the{" "}
                    <a href="/gallery" className="text-primary underline">public gallery</a>{" "}
                    upload form
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-4xl z-[100]" style={{ zIndex: 100 }}>
              <DialogHeader>
                <DialogTitle>Photo Details</DialogTitle>
              </DialogHeader>
              {selectedPhoto && (
                <div className="space-y-4">
                  <OrientationFixedImage
                    src={convertToPublicUrl(getImageUrl(selectedPhoto), { width: 1200, quality: 85, compress: true })}
                    alt={selectedPhoto.caption || selectedPhoto.filename}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                  <div className="space-y-2">
                    <p><strong>Filename:</strong> {selectedPhoto.filename}</p>
                    {selectedPhoto.caption && (
                      <p><strong>Caption:</strong> {selectedPhoto.caption}</p>
                    )}
                    {selectedPhoto.created_at && (
                      <p><strong>Uploaded:</strong> {new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                    )}
                    <p><strong>Public:</strong> {selectedPhoto.is_public ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
