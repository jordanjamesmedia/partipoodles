import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminSidebar from "@/components/AdminSidebar";
import { ObjectUploader } from "@/components/ObjectUploader";
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
import type { GalleryPhoto } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import OrientationFixedImage from "@/components/OrientationFixedImage";

// Convert storage URL to serving endpoint with compression support
function convertToPublicUrl(storageUrl: string, options?: {
  quality?: number;
  width?: number;
  height?: number;
  compress?: boolean;
}) {
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
  
  // Add compression parameters for fast loading
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
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect to home if not authenticated
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

  const { data: allPhotos = [], isLoading: photosLoading } = useQuery<GalleryPhoto[]>({
    queryKey: ["/api/admin/gallery"],
    enabled: !!isAuthenticated,
  });

  // Filter photos based on publication status
  const photos = allPhotos.filter(photo => {
    if (statusFilter === "public") return photo.isPublic;
    if (statusFilter === "private") return !photo.isPublic;
    return true; // "all"
  });

  const publicCount = allPhotos.filter(p => p.isPublic).length;
  const privateCount = allPhotos.filter(p => !p.isPublic).length;

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (photoData: { filename: string; url: string; caption?: string }) => {
      await apiRequest("POST", "/api/admin/gallery", photoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Photo added to gallery successfully",
      });
      setIsUploadOpen(false);
      setCaption("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add photo to gallery",
        variant: "destructive",
      });
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      await apiRequest("PUT", `/api/admin/gallery/${id}`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] }); // Refresh public gallery too
      toast({
        title: "Success",
        description: "Photo visibility updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update photo visibility",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/admin-login";
        }, 500);
        throw error;
      }
      toast({
        title: "Error",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      try {
        // Set ACL policy for the uploaded object
        await apiRequest("PUT", "/api/gallery-photos", {
          photoURL: uploadURL,
        });

        // Add to gallery - normalize the URL for admin uploads
        const filename = uploadedFile.name || 'uploaded-photo';
        
        // Convert the full GCS URL to a normalized object path
        let normalizedUrl = uploadURL || '';
        if (normalizedUrl.includes('storage.googleapis.com')) {
          const matches = normalizedUrl.match(/\/\.private\/uploads\/([^?]+)/);
          if (matches) {
            normalizedUrl = `/objects/uploads/${matches[1]}`;
          }
        }
        
        addPhotoMutation.mutate({
          filename,
          url: normalizedUrl,
          caption: caption.trim() || undefined,
        });
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
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
        toast({
          title: "Error",
          description: "Failed to process uploaded photo",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      deletePhotoMutation.mutate(id);
    }
  };

  const handleViewPhoto = (photo: GalleryPhoto) => {
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
                  <div>
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Input
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Enter photo caption..."
                      data-testid="input-photo-caption"
                    />
                  </div>
                  
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760} // 10MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-5 w-5" />
                      <span>Select Photo to Upload</span>
                    </div>
                  </ObjectUploader>
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
                  {photos.map((photo) => {
                    return (
                      <div key={photo.id} className="relative group">
                        <OrientationFixedImage 
                          src={convertToPublicUrl(photo.url, { width: 200, quality: 70, compress: true })} 
                          alt={photo.caption || photo.filename}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => handleViewPhoto(photo)}
                          data-testid={`img-gallery-${photo.id}`}
                        />
                        
                        {/* Public/Private Status Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                          photo.isPublic 
                            ? 'bg-green-500 text-white' 
                            : 'bg-yellow-500 text-black'
                        }`}>
                          {photo.isPublic ? (
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
                              data-testid={`button-view-${photo.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={photo.isPublic ? "outline" : "default"}
                              size="sm"
                              onClick={() => togglePublicMutation.mutate({ id: photo.id, isPublic: !photo.isPublic })}
                              disabled={togglePublicMutation.isPending}
                              data-testid={`button-toggle-${photo.id}`}
                              title={photo.isPublic ? "Make Private" : "Make Public"}
                            >
                              {photo.isPublic ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(photo.id)}
                              disabled={deletePhotoMutation.isPending}
                              data-testid={`button-delete-photo-${photo.id}`}
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
                  <Button 
                    onClick={() => setIsUploadOpen(true)} 
                    className="btn-primary"
                    data-testid="button-upload-first-photo"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Your First Photo
                  </Button>
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
                    src={convertToPublicUrl(selectedPhoto.url, { width: 1200, quality: 85, compress: true })} 
                    alt={selectedPhoto.caption || selectedPhoto.filename}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                  <div className="space-y-2">
                    <p><strong>Filename:</strong> {selectedPhoto.filename}</p>
                    {selectedPhoto.caption && (
                      <p><strong>Caption:</strong> {selectedPhoto.caption}</p>
                    )}
                    <p><strong>Uploaded:</strong> {new Date(selectedPhoto.createdAt!).toLocaleDateString()}</p>
                    <p><strong>Public:</strong> {selectedPhoto.isPublic ? 'Yes' : 'No'}</p>
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
