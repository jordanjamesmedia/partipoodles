import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PuppyCard from "@/components/PuppyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

export default function Puppies() {
  useSEO({
    title: 'Available Puppies - Standard Parti Poodle Puppies For Sale',
    description: 'View our available Standard Parti Poodle puppies. Health tested, vaccinated, and raised with love in Victoria, Australia. Find your perfect family companion.',
    canonical: '/puppies'
  });

  const puppiesData = useQuery(api.puppies.list);
  const littersData = useQuery(api.litters.list);
  
  const puppies = puppiesData ?? [];
  const litters = littersData ?? [];
  const isLoading = puppiesData === undefined;
  const error = null; // Convex handles errors differently

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Available Standard Parti Poodle Puppies</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Our beautiful Standard Parti Poodle puppies are ready for their forever homes. Each puppy is health tested, vaccinated, and comes with our comprehensive health guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Puppies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">Available Puppies</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              These gorgeous puppies are now ready to join loving families. All puppies are health checked, vaccinated, and come with our comprehensive health guarantee.
            </p>
          </div>

          {error && (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Puppies</h3>
              <p className="text-gray-600">Please try again later or contact us directly.</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="puppy-card">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : puppies.length > 0 ? (
            <div className="space-y-16">
              {/* Group puppies by litter and display each group with its parent info */}
              {(() => {
                // Group puppies by litter ID
                const puppiesByLitter = puppies.reduce((acc: Record<string, typeof puppies>, puppy) => {
                  const litterId = puppy.litter_id || 'unknown';
                  if (!acc[litterId]) {
                    acc[litterId] = [];
                  }
                  acc[litterId].push(puppy);
                  return acc;
                }, {});

                return Object.entries(puppiesByLitter).map(([litterId, litterPuppies]) => {
                  // Find the corresponding litter information
                  const currentLitter = litters.find((l) => l._id === litterId);
                  
                  return (
                    <div key={litterId}>
                      {/* Litter Header with Parent Information */}
                      <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-4">
                          {currentLitter?.name || litterPuppies[0]?.litter_name || 'Available Litter'}
                        </h3>
                      </div>
                      
                      {/* Puppies Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid={`puppies-grid-${litterId}`}>
                        {litterPuppies.map((puppy) => (
                          <PuppyCard 
                            key={puppy._id} 
                            puppy={puppy} 
                            showInquireButton 
                          />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Available Puppies</h3>
              <p className="text-gray-600">Check back soon for new arrivals! Contact us to be notified about upcoming litters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}