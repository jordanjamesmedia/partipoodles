import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PuppyCard from "@/components/PuppyCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Phone, Eye, HeartPulse, Home as HomeIcon, Award, Users, Brain, Leaf, Palette } from "lucide-react";
import pawPrintImage from "@assets/puppy paw print_1754361694595.png";
import familyPoodleImage from "@assets/1_1754364343232.png";

export default function Home() {
  const puppiesData = useQuery(api.puppies.list);
  const littersData = useQuery(api.litters.list);
  
  const puppies = puppiesData ?? [];
  const litters = littersData ?? [];
  const isLoading = puppiesData === undefined;

  const featuredPuppies = puppies.slice(0, 6);

  // Group puppies by litter
  const puppiesByLitter = featuredPuppies.reduce((acc, puppy) => {
    const litterId = puppy.litter_id || 'no-litter';
    if (!acc[litterId]) {
      acc[litterId] = [];
    }
    acc[litterId].push(puppy);
    return acc;
  }, {} as Record<string, typeof puppies>);

  // Get litter info for each group
  const getLitterInfo = (litterId: string) => {
    if (litterId === 'no-litter') return null;
    return litters.find((litter) => litter._id === litterId);
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navigation />
      
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${familyPoodleImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70"></div>

        {/* Animated dog paw print icons - subtle and random */}
        <img src={pawPrintImage} alt="Paw print" className="absolute paw-print paw-print-1 opacity-0 w-6 h-6 rotate-12" />
        <img src={pawPrintImage} alt="Paw print" className="absolute paw-print paw-print-2 opacity-0 w-4 h-4 -rotate-45" />
        <img src={pawPrintImage} alt="Paw print" className="absolute paw-print paw-print-3 opacity-0 w-5 h-5 rotate-90" />
        <img src={pawPrintImage} alt="Paw print" className="absolute paw-print paw-print-4 opacity-0 w-7 h-7 -rotate-12" />
        <img src={pawPrintImage} alt="Paw print" className="absolute paw-print paw-print-5 opacity-0 w-3 h-3 rotate-45" />
        
        <div className="relative z-10 text-center text-gray-800 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Premium Standard<br />
            <span className="text-primary">Parti Poodles</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light text-gray-600">
            Discover the joy and elegance of Standard Parti Poodles.<br />
            Raised with love and care in the heart of Victoria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/puppies">
              <Button className="btn-primary" data-testid="button-view-puppies">
                <Heart className="mr-2 h-6 w-6" />
                View Available Puppies
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="btn-secondary" data-testid="button-contact-us">
                <Phone className="mr-2 h-6 w-6" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Puppies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
              Current Litters
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Meet our beautiful Standard Parti Poodle puppies currently available
            </p>
          </div>

          {isLoading ? (
            <div className="text-center mb-16">
              <h3 className="text-2xl font-semibold text-gray-600 mb-6">Loading Available Puppies...</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="puppy-card animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : Object.keys(puppiesByLitter).length > 0 ? (
            Object.entries(puppiesByLitter).map(([litterId, litterPuppies]) => {
              const litterInfo = getLitterInfo(litterId);
              
              return (
                <div key={litterId} className="mb-16 last:mb-0">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">
                      {litterInfo ? litterInfo.name : 'Available Puppies'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {litterPuppies.map((puppy) => (
                      <PuppyCard key={puppy._id} puppy={puppy} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center mb-16">
              <h3 className="text-3xl font-semibold text-gray-600 mb-6">No Puppies Currently Available</h3>
              <p className="text-xl text-gray-600">Check back soon for new litters!</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/puppies">
              <Button className="btn-secondary" data-testid="button-view-all-puppies">
                <Eye className="mr-2 h-6 w-6" />
                View All Available Puppies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-6">Welcome to Our Family</h2>
              <p className="text-xl text-gray-600 mb-8">
                With over 13 years of dedicated breeding experience, we specialise in raising healthy, vibrant Standard Parti Poodles with stunning colors and patterns.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <HeartPulse className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Health Tested</h3>
                    <p className="text-gray-600">All our breeding dogs undergo comprehensive health testing to ensure the healthiest puppies possible.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <HomeIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Loving Care</h3>
                    <p className="text-gray-600">Our puppies are raised in a loving home environment with early socialization and handling.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">13+ Years Experience</h3>
                    <p className="text-gray-600">Over a decade of breeding experience with Standard Parti Poodles and commitment to excellence.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Family Friendly</h3>
                    <p className="text-gray-600">Known for their gentle nature with children and adaptability to family life.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={familyPoodleImage}
                alt="Our beloved poodle family member" 
                className="rounded-2xl shadow-2xl w-full object-cover h-96"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">13+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-6">Why Choose Standard Parti Poodles?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="feature-icon bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Intelligent & Trainable</h3>
              <p className="text-gray-600">Standard Poodles are renowned for their intelligence and eagerness to please, making them excellent family companions.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="feature-icon bg-primary/10">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Hypoallergenic Coat</h3>
              <p className="text-gray-600">Low-shedding, hypoallergenic coat ideal for families with allergies while maintaining beautiful appearance.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="feature-icon bg-primary/10">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Unique Parti Coloring</h3>
              <p className="text-gray-600">Stunning two-color patterns that make each dog unique and eye-catching with wonderful temperament.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="feature-icon bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Family Friendly</h3>
              <p className="text-gray-600">Gentle nature with children and adaptability to family life, making them perfect lifelong companions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to Find Your Perfect Companion?</h2>
          <p className="text-xl text-gray-300 mb-8">Contact us today to learn more about our available puppies and reserve your future family member.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="btn-primary" data-testid="button-get-in-touch">
                Get In Touch
              </Button>
            </Link>
            <a href="tel:+61498114541" className="inline-block">
              <Button variant="outline" className="border-2 border-white bg-transparent hover:bg-white text-white hover:text-[#B8956A] px-6 py-3 font-semibold transition-all duration-200" data-testid="button-call-now">
                <Phone className="mr-2 h-6 w-6" />
                Call Now: (04) 9811 4541
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
