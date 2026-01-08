import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState, useRef, useEffect, useCallback } from "react";
import { Eye, X, Upload, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import OrientationFixedImage from "@/components/OrientationFixedImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

// Photo type for Convex
interface GalleryPhotoData {
  _id: string;
  url: string;
  imageUrl?: string; // Resolved URL from Convex storage
  caption?: string | null;
  filename: string;
  is_public?: boolean;
}

export default function Gallery() {
  const uploadFormRef = useRef<HTMLElement>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderEmail, setUploaderEmail] = useState("");
  const [puppyName, setPuppyName] = useState("");
  const [caption, setCaption] = useState("");
  const [ageDescription, setAgeDescription] = useState("");
  const [photoType, setPhotoType] = useState("single");
  const [relatedPhotoId, setRelatedPhotoId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [selectedParents, setSelectedParents] = useState<{dam: string; sire: string}>({dam: "none", sire: "none"});
  const { toast } = useToast();

  // Function to handle showing upload form and scrolling to it
  const showUploadFormAndScroll = () => {
    setShowUploadForm(true);
    // Small delay to ensure the form is rendered before scrolling
    setTimeout(() => {
      uploadFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  
  const photosData = useQuery(api.galleryPhotos.listPublic);
  const parentDogsData = useQuery(api.parentDogs.list);
  
  const photos = photosData ?? [];
  const parentDogs = parentDogsData ?? [];
  const isLoading = photosData === undefined;
  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  // Lightbox navigation
  const goToPrevious = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setImageLoaded(false);
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  }, [selectedPhotoIndex]);

  const goToNext = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setImageLoaded(false);
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  }, [selectedPhotoIndex, photos.length]);

  const closeLightbox = useCallback(() => {
    setSelectedPhotoIndex(null);
    setImageLoaded(false);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, goToPrevious, goToNext, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhotoIndex]);

  // Get the best available image URL
  const getImageUrl = (photo: GalleryPhotoData) => {
    // Prefer imageUrl (resolved from Convex storage) over url
    return photo.imageUrl || photo.url;
  };

  // Convert storage URL to serving endpoint with compression support
  const convertToPublicUrl = (storageUrl: string, options?: {
    quality?: number;
    width?: number;
    height?: number;
    compress?: boolean;
  }) => {
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
  };

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/public/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (!result.successful || result.successful.length === 0) {
      toast({
        title: "Upload failed",
        description: "No files were uploaded successfully.",
        variant: "destructive",
      });
      return;
    }

    const uploadedFile = result.successful[0];
    const uploadURL = uploadedFile.uploadURL;
    
    // Store the uploaded file URL and selected file info
    setUploadedFileUrl(uploadURL || null);
    setSelectedFile(uploadedFile.data as File);
    
    toast({
      title: "Photo uploaded successfully!",
      description: "Please review your information and click Submit to send your photo for approval.",
    });
  };

  const handleFormSubmit = async () => {
    if (!uploaderName || !uploaderEmail) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedFileUrl) {
      toast({
        title: "No photo uploaded",
        description: "Please upload a photo first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/gallery-photos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoURL: uploadedFileUrl,
          name: uploaderName,
          email: uploaderEmail,
          puppyName: puppyName || null,
          caption: caption || `Photo by ${uploaderName}`,
          parentDam: selectedParents.dam !== "none" ? selectedParents.dam : null,
          parentSire: selectedParents.sire !== "none" ? selectedParents.sire : null,
          ageDescription: ageDescription || null,
          photoType: photoType,
          relatedPhotoId: relatedPhotoId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit photo");
      }

      toast({
        title: "Photo submitted successfully!",
        description: "Your photo will be reviewed by our team before appearing in the gallery.",
      });

      // Reset form and hide upload interface
      setUploaderName("");
      setUploaderEmail("");
      setPuppyName("");
      setCaption("");
      setAgeDescription("");
      setPhotoType("single");
      setRelatedPhotoId("");
      setSelectedParents({dam: "none", sire: "none"});
      setShowUploadForm(false);
      setShowFileUpload(false);
      setUploadedFileUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error submitting photo:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 to-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-800 mb-6">
            Photo Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our beautiful collection of Standard Parti Poodles, capturing their unique personalities, 
            stunning parti coloring, and the joy they bring to our breeding program.
          </p>
        </div>
      </section>

      {/* Upload Form Section */}
      {showUploadForm && (
        <section ref={uploadFormRef} className="py-8 bg-gray-50 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Share Your Puppy's Photo
                </CardTitle>
                <CardDescription>
                  We'd love to see photos of your parti poodle! Upload a photo and it will be reviewed by our team before appearing in the gallery.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="upload-name" className="text-sm font-medium">
                        Your Name *
                      </Label>
                      <Input
                        id="upload-name"
                        name="uploaderName"
                        type="text"
                        placeholder="Enter your name"
                        value={uploaderName}
                        onChange={(e) => setUploaderName(e.target.value)}
                        required
                        data-testid="input-uploader-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upload-email" className="text-sm font-medium">
                        Your Email *
                      </Label>
                      <Input
                        id="upload-email"
                        name="uploaderEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={uploaderEmail}
                        onChange={(e) => setUploaderEmail(e.target.value)}
                        required
                        data-testid="input-uploader-email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="puppy-name" className="text-sm font-medium">
                      Puppy's Name (optional)
                    </Label>
                    <Input
                      id="puppy-name"
                      name="puppyName"
                      type="text"
                      placeholder="Enter your puppy's name"
                      value={puppyName}
                      onChange={(e) => setPuppyName(e.target.value)}
                      data-testid="input-puppy-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age-description" className="text-sm font-medium">
                        Age When Photo Was Taken
                      </Label>
                      <Select value={ageDescription} onValueChange={setAgeDescription}>
                        <SelectTrigger data-testid="select-age-description">
                          <SelectValue placeholder="Select age..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newborn">Newborn (0-2 weeks)</SelectItem>
                          <SelectItem value="2-weeks">2 weeks old</SelectItem>
                          <SelectItem value="4-weeks">4 weeks old</SelectItem>
                          <SelectItem value="6-weeks">6 weeks old</SelectItem>
                          <SelectItem value="8-weeks">8 weeks old</SelectItem>
                          <SelectItem value="3-months">3 months old</SelectItem>
                          <SelectItem value="6-months">6 months old</SelectItem>
                          <SelectItem value="1-year">1 year old</SelectItem>
                          <SelectItem value="adult">Adult (2+ years)</SelectItem>
                          <SelectItem value="senior">Senior (7+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="photo-type" className="text-sm font-medium">
                        Photo Type
                      </Label>
                      <Select value={photoType} onValueChange={setPhotoType}>
                        <SelectTrigger data-testid="select-photo-type">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Photo</SelectItem>
                          <SelectItem value="before">Before Photo (puppy stage)</SelectItem>
                          <SelectItem value="after">After Photo (grown up)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {photoType === "after" && (
                    <div className="space-y-2">
                      <Label htmlFor="related-photo-id" className="text-sm font-medium">
                        Related "Before" Photo ID (optional)
                      </Label>
                      <Input
                        id="related-photo-id"
                        name="relatedPhotoId"
                        type="text"
                        placeholder="Enter the ID of the related before photo"
                        value={relatedPhotoId}
                        onChange={(e) => setRelatedPhotoId(e.target.value)}
                        data-testid="input-related-photo-id"
                      />
                      <p className="text-sm text-gray-500">
                        To create a before/after comparison, first upload a "before" photo and note its ID, then upload this "after" photo with that ID.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="photo-caption" className="text-sm font-medium">
                      Photo Caption (optional)
                    </Label>
                    <Textarea
                      id="photo-caption"
                      name="caption"
                      placeholder="Tell us about this photo..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={3}
                      data-testid="textarea-photo-caption"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent-dam" className="text-sm font-medium">
                        Dam (Mother) - optional
                      </Label>
                      <Select value={selectedParents.dam} onValueChange={(value) => setSelectedParents(prev => ({...prev, dam: value}))}>
                        <SelectTrigger data-testid="select-parent-dam">
                          <SelectValue placeholder="Select dam if known" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None selected</SelectItem>
                          {parentDogs.filter((dog) => dog.gender === 'female').map((dog) => (
                            <SelectItem key={dog._id} value={dog._id}>
                              {dog.name} ({dog.color})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent-sire" className="text-sm font-medium">
                        Sire (Father) - optional
                      </Label>
                      <Select value={selectedParents.sire} onValueChange={(value) => setSelectedParents(prev => ({...prev, sire: value}))}>
                        <SelectTrigger data-testid="select-parent-sire">
                          <SelectValue placeholder="Select sire if known" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None selected</SelectItem>
                          {parentDogs.filter((dog) => dog.gender === 'male').map((dog) => (
                            <SelectItem key={dog._id} value={dog._id}>
                              {dog.name} ({dog.color})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!showFileUpload ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!uploaderName || !uploaderEmail) {
                            toast({
                              title: "Missing required information",
                              description: "Please provide your name and email before selecting a photo.",
                              variant: "destructive",
                            });
                            return;
                          }
                          setShowFileUpload(true);
                        }}
                        className="bg-[#B8956A] hover:bg-[#A0825A] text-white"
                        data-testid="button-continue-to-upload"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Continue to Photo Upload
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowUploadForm(false)}
                        data-testid="button-cancel-upload"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Upload Photo (1 photo only)</Label>
                      {!uploadedFileUrl ? (
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760} // 10MB
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handleUploadComplete}
                          buttonClassName="w-full"
                        >
                          <div className="flex items-center justify-center gap-2 py-2">
                            <Upload className="h-4 w-4" />
                            <span>Choose Photo to Upload</span>
                          </div>
                        </ObjectUploader>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 text-sm mb-2">
                            ✓ Photo uploaded successfully: {selectedFile?.name}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadedFileUrl(null);
                              setSelectedFile(null);
                            }}
                            data-testid="button-remove-photo"
                          >
                            Remove Photo
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Maximum file size: 10MB. Supported formats: JPG, PNG, GIF
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleFormSubmit}
                          disabled={isSubmitting || !uploadedFileUrl}
                          className="bg-[#B8956A] hover:bg-[#A0825A] text-white"
                          data-testid="button-submit-photo"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Photo"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowFileUpload(false)}
                          disabled={isSubmitting}
                          data-testid="button-back-to-form"
                        >
                          Back to Form
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowUploadForm(false);
                            setShowFileUpload(false);
                            setUploadedFileUrl(null);
                            setSelectedFile(null);
                          }}
                          disabled={isSubmitting}
                          data-testid="button-cancel-upload"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo, index) => (
                <div
                  key={photo._id}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setImageLoaded(false);
                    setSelectedPhotoIndex(index);
                  }}
                  data-testid={`gallery-photo-${photo._id}`}
                >
                  <OrientationFixedImage
                    src={convertToPublicUrl(getImageUrl(photo), { width: 400, quality: 65, compress: true })}
                    alt={photo.caption || "Gallery photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Eye className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Photos Yet</h3>
                <p className="text-gray-600 mb-8">
                  We're currently building our photo gallery. Check back soon for beautiful images of our Standard Parti Poodles!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upload CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
            Share Your Puppy's Photo
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We'd love to see photos of your Standard Parti Poodle! Share your favorite moments and help us celebrate these amazing dogs together.
          </p>
          <Button
            onClick={() => showUploadForm ? setShowUploadForm(false) : showUploadFormAndScroll()}
            className="bg-[#B8956A] hover:bg-[#A0825A] text-white"
            size="lg"
            data-testid="button-share-photo-bottom"
          >
            <Camera className="h-5 w-5 mr-2" />
            {showUploadForm ? "Hide Upload Form" : "Share Your Photo"}
          </Button>
        </div>
      </section>

      {/* Custom Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 w-screen h-screen flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/95" />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
            data-testid="close-photo-modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation buttons */}
          {selectedPhotoIndex !== null && selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
              data-testid="lightbox-prev"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
              data-testid="lightbox-next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Loading spinner - centered on screen */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white" />
            </div>
          )}

          {/* Image container */}
          <div
            className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main image */}
            <img
              src={convertToPublicUrl(getImageUrl(selectedPhoto), { compress: false })}
              alt={selectedPhoto.caption || "Gallery photo"}
              className={`max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />

            {/* Caption */}
            {selectedPhoto.caption && imageLoaded && (
              <div className="mt-4 px-6 py-3 bg-black/50 backdrop-blur-sm rounded-full max-w-[90vw]">
                <p className="text-white text-center font-medium text-sm md:text-base truncate">{selectedPhoto.caption}</p>
              </div>
            )}

            {/* Photo counter */}
            {imageLoaded && (
              <div className="mt-3 text-white/60 text-sm">
                {selectedPhotoIndex !== null && `${selectedPhotoIndex + 1} / ${photos.length}`}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}