import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import OrientationFixedImage from "@/components/OrientationFixedImage";

interface PuppyGalleryProps {
  photos: string[];
  puppyName: string;
  puppyColor: string;
  puppyGender: string;
  trigger: React.ReactNode;
}

function convertToPublicUrl(url: string, options?: {
  quality?: number;
  width?: number;
  height?: number;
  compress?: boolean;
}): string {
  let publicUrl = url;
  
  if (url.startsWith('/objects/uploads/')) {
    publicUrl = url.replace('/objects/uploads/', '/public-objects/uploads/');
  } else if (url.includes('storage.googleapis.com')) {
    const matches = url.match(/\/\.private\/uploads\/([^?]+)/);
    if (matches) {
      publicUrl = `/public-objects/uploads/${matches[1]}`;
    } else {
      const altMatches = url.match(/uploads\/([^?]+)/);
      if (altMatches) {
        publicUrl = `/public-objects/uploads/${altMatches[1]}`;
      }
    }
  } else {
    publicUrl = url;
  }
  
  // Add compression parameters for fast loading
  const params = new URLSearchParams();
  
  // Set defaults for aggressive compression
  const quality = options?.quality ?? 70; // Lower default for faster loading  
  const width = options?.width;
  const height = options?.height;
  const compress = options?.compress !== false;
  
  if (compress) {
    params.append('compress', 'true');
    params.append('quality', quality.toString());
    
    if (width) {
      params.append('width', width.toString());
    }
    if (height) {
      params.append('height', height.toString());
    }
  }
  
  if (params.toString()) {
    publicUrl += `?${params.toString()}`;
  }
  
  return publicUrl;
}

// Progressive Image Component for better performance
function ProgressiveImage({ src, previewSrc, alt, className, ...props }: {
  src: string;
  previewSrc: string;
  alt: string;
  className?: string;
  [key: string]: any;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  return (
    <div className="relative">
      {/* Low quality preview for instant loading */}
      <OrientationFixedImage
        src={previewSrc}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setPreviewLoaded(true)}
        style={{ filter: 'blur(2px)' }}
        {...props}
      />
      
      {/* High quality image */}
      <OrientationFixedImage
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 absolute inset-0`}
        onLoad={() => setImageLoaded(true)}
        {...props}
      />
    </div>
  );
}

export default function PuppyGallery({ photos, puppyName, puppyColor, puppyGender, trigger }: PuppyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Generate multiple quality versions for progressive loading
  const thumbnailPhotos = photos.map(url => convertToPublicUrl(url, { 
    width: 120, 
    height: 120, 
    quality: 60 // Very aggressive compression for thumbnails
  }));
  
  const previewPhotos = photos.map(url => convertToPublicUrl(url, { 
    width: 600, 
    quality: 65 // Low quality preview for fast initial display
  }));
  
  const fullSizePhotos = photos.map(url => convertToPublicUrl(url, { 
    width: 1200, 
    quality: 80 // Balanced quality for full view
  }));
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % fullSizePhotos.length);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + fullSizePhotos.length) % fullSizePhotos.length);
  };
  
  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (fullSizePhotos.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-transparent border-none">
        <DialogPrimitive.Close className="absolute right-4 top-4 z-50 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 p-2 text-white transition-all duration-200" data-testid="gallery-close-button">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Main Image with Progressive Loading */}
          <div className="relative">
            <ProgressiveImage
              src={fullSizePhotos[currentIndex]}
              previewSrc={previewPhotos[currentIndex]}
              alt={`${puppyName} - ${puppyColor} ${puppyGender} - Photo ${currentIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {/* Navigation Arrows - only show if more than 1 photo */}
            {fullSizePhotos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-full text-white transition-all duration-200"
                  data-testid="gallery-prev-button"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-full text-white transition-all duration-200"
                  data-testid="gallery-next-button"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
              <p className="font-semibold">{puppyName} - {puppyColor} {puppyGender === 'male' ? 'Boy' : 'Girl'}</p>
              {fullSizePhotos.length > 1 && (
                <p className="text-sm opacity-75">{currentIndex + 1} of {fullSizePhotos.length}</p>
              )}
            </div>
          </div>
          
          {/* Thumbnail Strip - only show if more than 1 photo */}
          {fullSizePhotos.length > 1 && (
            <div className="bg-black bg-opacity-90 p-4">
              <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
                {thumbnailPhotos.map((photo: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                      index === currentIndex 
                        ? 'ring-2 ring-white ring-opacity-80 opacity-100' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                    data-testid={`gallery-thumbnail-${index}`}
                  >
                    <OrientationFixedImage 
                      src={photo}
                      alt={`${puppyName} thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}