import { useParams, Link } from "wouter";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowLeft, Calendar, User, Heart, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PuppyGallery from "@/components/PuppyGallery";
import type { Id } from "../../../convex/_generated/dataModel";

export default function PuppyDetails() {
  const params = useParams();
  const puppyId = params.id as Id<"puppies"> | undefined;

  // Get all puppies and find the one we want
  const allPuppiesData = useQuery(api.puppies.list);
  const allPuppies = allPuppiesData ?? [];
  
  // Find the specific puppy
  const puppy = puppyId ? allPuppies.find(p => p._id === puppyId) : undefined;
  const isLoading = allPuppiesData === undefined;
  const error = !puppy && !isLoading && puppyId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puppy details...</p>
        </div>
      </div>
    );
  }

  if (error || !puppy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Puppy Not Found</h1>
          <p className="text-gray-600 mb-6">The puppy you're looking for doesn't exist or has been removed.</p>
          <Link href="/puppies">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Puppies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find litter mates
  const litterMates = allPuppies.filter(p => 
    p.litter_id === puppy.litter_id && p._id !== puppy._id
  );

  const formatPrice = (priceMin: number | null, priceMax: number | null) => {
    if (!priceMin && !priceMax) return "Contact for Price";
    if (priceMin && priceMax && priceMin !== priceMax) {
      return `$${(priceMin / 100).toLocaleString('en-AU')} - $${(priceMax / 100).toLocaleString('en-AU')} AUD`;
    }
    const price = priceMin || priceMax;
    return `$${(price! / 100).toLocaleString('en-AU')} AUD`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const convertToPublicUrl = (url: string): string => {
    if (url.startsWith('/objects/uploads/')) {
      return url.replace('/objects/uploads/', '/public-objects/uploads/');
    }
    
    if (url.includes('storage.googleapis.com')) {
      const matches = url.match(/\/\.private\/uploads\/([^?]+)/);
      if (matches) {
        return `/public-objects/uploads/${matches[1]}`;
      }
      const altMatches = url.match(/uploads\/([^?]+)/);
      if (altMatches) {
        return `/public-objects/uploads/${altMatches[1]}`;
      }
    }
    
    return url;
  };

  const mainPhoto = puppy.photos && puppy.photos.length > 0 
    ? convertToPublicUrl(puppy.photos[0])
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/puppies">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Puppies
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photo Gallery */}
          <div className="space-y-4">
            {mainPhoto ? (
              <>
                {/* Main Image */}
                <PuppyGallery
                  photos={puppy.photos || []}
                  puppyName={puppy.name}
                  puppyColor={puppy.color || ''}
                  puppyGender={puppy.gender || ''}
                  trigger={
                    <div className="relative cursor-pointer group">
                      <img 
                        src={mainPhoto}
                        alt={`${puppy.name} - ${puppy.color} ${puppy.gender}`}
                        className="w-full h-96 object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-xl">
                        <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-gray-800 font-medium">
                            {puppy.photos && puppy.photos.length > 1 
                              ? `View all ${puppy.photos.length} photos` 
                              : 'View photo'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                />
                
                {/* Thumbnail Gallery - show if more than 1 photo */}
                {puppy.photos && puppy.photos.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      All Photos ({puppy.photos.length})
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {puppy.photos.map((photo, index) => {
                        const convertedPhoto = convertToPublicUrl(photo);
                        return (
                          <PuppyGallery
                            key={index}
                            photos={puppy.photos || []}
                            puppyName={puppy.name}
                            puppyColor={puppy.color || ''}
                            puppyGender={puppy.gender || ''}
                            trigger={
                              <div className="relative cursor-pointer group">
                                <img 
                                  src={convertedPhoto}
                                  alt={`${puppy.name} - Photo ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg shadow transition-transform duration-200 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg"></div>
                              </div>
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex flex-col items-center justify-center">
                <img 
                  src="/attached_assets/puppy paw print_1754361694595.png"
                  alt="Paw print"
                  className="w-20 h-20 opacity-60 mb-4"
                />
                <span className="text-orange-700 font-medium">Photo coming soon</span>
              </div>
            )}
          </div>

          {/* Puppy Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-serif text-gray-800 mb-2">
                      {puppy.name}
                    </CardTitle>
                    <p className="text-xl text-primary font-medium">
                      {puppy.color} {puppy.gender === 'male' ? 'Boy' : 'Girl'}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeClass(puppy.status || 'available')}>
                    {getStatusText(puppy.status || 'available')}
                  </Badge>
                </div>
              </CardHeader>
               <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-gray-800">
                  {formatPrice(puppy.price_min ?? null, puppy.price_max ?? null)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">🎂</span>
                    <span>
                      {puppy.litter_date_of_birth ? (
                        new Date(puppy.litter_date_of_birth).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      ) : (
                        'Birth date unknown'
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="mr-2 h-4 w-4" />
                    {puppy.gender === 'male' ? 'Male' : 'Female'}
                  </div>
                </div>

                {puppy.description && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-2">About {puppy.name}</h4>
                    <p className="text-gray-600 leading-relaxed">{puppy.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parent Information */}
            {(puppy.parent_sire || puppy.parent_dam) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {puppy.parent_sire && (
                    <div>
                      <span className="font-medium text-gray-700">Sire: </span>
                      <span className="text-gray-600">{puppy.parent_sire}</span>
                    </div>
                  )}
                  {puppy.parent_dam && (
                    <div>
                      <span className="font-medium text-gray-700">Dam: </span>
                      <span className="text-gray-600">{puppy.parent_dam}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Action */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Interested in {puppy.name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  Contact us to learn more about this beautiful puppy and arrange a visit.
                </p>
                <Link href={`/contact?puppy=${encodeURIComponent(puppy.name.toLowerCase())}`}>
                  <Button size="lg" className="w-full">
                    <Heart className="mr-2 h-5 w-5" />
                    Enquire About {puppy.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Litter Mates */}
        {litterMates.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Litter Mates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {litterMates.map((litterMate) => {
                const matePhoto = litterMate.photos && litterMate.photos.length > 0 
                  ? convertToPublicUrl(litterMate.photos[0])
                  : null;

                  return (
                  <Card key={litterMate._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/puppy/${litterMate._id}`}>
                      <div className="cursor-pointer">
                        {matePhoto ? (
                          <img 
                            src={matePhoto}
                            alt={`${litterMate.name} - ${litterMate.color} ${litterMate.gender}`}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex flex-col items-center justify-center">
                            <img 
                              src="/attached_assets/puppy paw print_1754361694595.png"
                              alt="Paw print"
                              className="w-12 h-12 opacity-60 mb-2"
                            />
                            <span className="text-orange-700 text-sm">Photo coming soon</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-1">{litterMate.name}</h3>
                          <p className="text-sm text-gray-600">{litterMate.color} {litterMate.gender === 'male' ? 'Boy' : 'Girl'}</p>
                          <div className="flex justify-between items-center mt-2">
                            <Badge className={getStatusBadgeClass(litterMate.status || 'available')} variant="secondary">
                              {getStatusText(litterMate.status || 'available')}
                            </Badge>
                            <span className="text-sm font-medium text-gray-800">
                              {formatPrice(litterMate.price_min ?? null, litterMate.price_max ?? null)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}