import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, User, ZoomIn, X, Eye, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import PuppyGallery from "@/components/PuppyGallery";
import type { Puppy } from "@shared/schema";

interface PuppyCardProps {
  puppy: Puppy;
  showInquireButton?: boolean;
}

export default function PuppyCard({ puppy, showInquireButton = false }: PuppyCardProps) {
  const formatPrice = (priceMin: number | null, priceMax: number | null) => {
    if (!priceMin && !priceMax) return "Contact for Price";
    if (priceMin && priceMax && priceMin !== priceMax) {
      return `$${(priceMin / 100).toLocaleString('en-AU')} - $${(priceMax / 100).toLocaleString('en-AU')} AUD`;
    }
    // If min and max are the same, show as single price
    const price = priceMin || priceMax;
    return `$${(price! / 100).toLocaleString('en-AU')} AUD`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-badge status-available';
      case 'reserved':
        return 'status-badge status-reserved';
      case 'sold':
        return 'status-badge status-sold';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'sold':
        return 'Sold';
      default:
        return status;
    }
  };

  // Convert storage URL to public serving endpoint with compression support
  const convertToPublicUrl = (storageUrl: string, options?: {
    quality?: number;
    width?: number;
    height?: number;
  }) => {
    let publicUrl = storageUrl;
    
    // Handle /objects/uploads/ URLs by converting to public serving endpoint
    if (storageUrl.startsWith('/objects/uploads/')) {
      publicUrl = storageUrl.replace('/objects/uploads/', '/public-objects/uploads/');
    } else if (storageUrl.includes('storage.googleapis.com')) {
      // Extract the file ID from the Google Cloud Storage URL
      const matches = storageUrl.match(/\/\.private\/uploads\/([^?]+)/);
      if (matches) {
        publicUrl = `/public-objects/uploads/${matches[1]}`;
      } else {
        // Also try to match different URL patterns
        const altMatches = storageUrl.match(/uploads\/([^?]+)/);
        if (altMatches) {
          publicUrl = `/public-objects/uploads/${altMatches[1]}`;
        }
      }
    }
    
    // Add compression parameters for better performance
    if (options && (options.quality || options.width || options.height)) {
      const params = new URLSearchParams();
      
      if (options.quality && options.quality !== 80) {
        params.append('quality', options.quality.toString());
      }
      if (options.width) {
        params.append('width', options.width.toString());
      }
      if (options.height) {
        params.append('height', options.height.toString());
      }
      
      if (params.toString()) {
        publicUrl += `?${params.toString()}`;
      }
    }
    
    return publicUrl;
  };

  // Use first photo if available with aggressive compression for fast loading
  const mainPhoto = puppy.photos && puppy.photos.length > 0 
    ? convertToPublicUrl(puppy.photos[0], { width: 500, quality: 70 })
    : null;

  return (
    <div className="puppy-card bg-white shadow-lg rounded-xl overflow-hidden" data-testid={`puppy-card-${puppy.id}`}>
      {/* Top - Large Photo with Gallery Lightbox */}
      {mainPhoto && (
        <div className="relative group h-80 md:h-96">
          <PuppyGallery
            photos={puppy.photos || []}
            puppyName={puppy.name}
            puppyColor={puppy.color}
            puppyGender={puppy.gender}
            trigger={
              <div className="relative cursor-pointer h-full w-full">
                <img 
                  src={mainPhoto}
                  alt={`${puppy.name} - ${puppy.color} ${puppy.gender}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-testid={`puppy-image-${puppy.id}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white bg-opacity-95 px-4 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <ZoomIn className="h-5 w-5 text-gray-800" />
                    <span className="text-gray-800 font-semibold text-sm">
                      {puppy.photos && puppy.photos.length > 1 
                        ? `Click to view all ${puppy.photos.length} photos` 
                        : 'Click to view photo'
                      }
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={getStatusBadgeClass(puppy.status)} data-testid={`puppy-status-${puppy.id}`}>
                    {getStatusText(puppy.status)}
                  </span>
                </div>
                {puppy.photos && puppy.photos.length > 1 && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span>{puppy.photos.length}</span>
                    </div>
                  </div>
                )}
              </div>
            }
          />
        </div>
      )}
      
      {/* Bottom - Information */}
      <div className="p-6">
        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2" data-testid={`puppy-name-${puppy.id}`}>
          {puppy.name} - {puppy.color} {puppy.gender === 'male' ? 'Boy' : 'Girl'}
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 mb-4 gap-2">
          <span className="flex items-center" data-testid={`puppy-dob-${puppy.id}`}>
            <span className="mr-1">🎂</span>
            {puppy.litterDateOfBirth ? (
              new Date(puppy.litterDateOfBirth).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            ) : (
              'Birth date unknown'
            )}
          </span>
          <span className="flex items-center" data-testid={`puppy-gender-${puppy.id}`}>
            <User className="mr-1 h-4 w-4" />
            {puppy.gender === 'male' ? 'Male' : 'Female'}
          </span>
        </div>
        
        {puppy.description && (
          <p className="text-gray-600 mb-4 line-clamp-3" data-testid={`puppy-description-${puppy.id}`}>
            {puppy.description}
          </p>
        )}
        
        <div className="mb-4">
          <span className="text-lg font-semibold text-primary" data-testid={`puppy-price-${puppy.id}`}>
            {formatPrice(puppy.priceMin, puppy.priceMax)}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/puppy/${puppy.id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-view-details-${puppy.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
          {showInquireButton && (
            <Link href={`/contact?puppy=${encodeURIComponent(puppy.name.toLowerCase())}`} className="flex-1">
              <Button className="w-full btn-primary" data-testid={`button-inquire-${puppy.id}`}>
                <Heart className="mr-2 h-4 w-4" />
                Enquire
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
