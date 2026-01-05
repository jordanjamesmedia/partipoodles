import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParentDogCard from "@/components/ParentDogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Award, Shield } from "lucide-react";
import type { ParentDog } from "@shared/schema";

export default function Parents() {
  const { data: parentDogs = [], isLoading, error } = useQuery<ParentDog[]>({
    queryKey: ["/api/parent-dogs"],
  });

  const activeDams = parentDogs.filter(dog => dog.gender === 'female' && dog.status === 'active');
  const activeSires = parentDogs.filter(dog => dog.gender === 'male' && dog.status === 'active');

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Our Breeding Dogs</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Meet the exceptional Standard Parti Poodles behind our breeding program. Each parent is carefully selected for 
              temperament, health, conformation, and their ability to produce beautiful, healthy puppies.
            </p>
          </div>
        </div>
      </section>

      {/* Breeding Philosophy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">Our Breeding Philosophy</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-12">
              We believe in responsible breeding practices that prioritize health, temperament, and breed standard. 
              Every parent dog in our program undergoes comprehensive health testing and is evaluated for their 
              contribution to preserving and improving the Standard Parti Poodle breed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Health First</h3>
                <p className="text-gray-600">
                  Comprehensive health testing including hip/elbow scoring, eye clearances, and genetic testing
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Temperament</h3>
                <p className="text-gray-600">
                  Gentle, intelligent, and well-socialized dogs with excellent family-friendly temperaments
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  Adherence to breed standards with attention to conformation, coat, and parti coloring
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parent Dogs Section */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Parent Dogs</h3>
              <p className="text-gray-600">Please try again later or contact us directly.</p>
            </div>
          )}

          {isLoading ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="parent-dog-card">
                    <Skeleton className="h-64 w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Dams Section */}
              {activeDams.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">Our Dams</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      The exceptional mothers in our breeding program, chosen for their maternal instincts, 
                      health, and ability to produce beautiful parti-colored offspring.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="dams-grid">
                    {activeDams.map((dam) => (
                      <ParentDogCard key={dam.id} parentDog={dam} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sires Section */}
              {activeSires.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">Our Sires</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      The outstanding fathers in our breeding program, selected for their conformation, 
                      temperament, and contribution to the parti poodle gene pool.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="sires-grid">
                    {activeSires.map((sire) => (
                      <ParentDogCard key={sire.id} parentDog={sire} />
                    ))}
                  </div>
                </div>
              )}

              {/* No parent dogs message */}
              {parentDogs.length === 0 && (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Coming Soon</h3>
                    <p className="text-gray-600 mb-8">
                      We're currently setting up our parent dog profiles. Check back soon to meet our exceptional breeding dogs!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}