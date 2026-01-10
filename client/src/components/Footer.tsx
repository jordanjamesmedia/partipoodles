import { Link } from "wouter";
import { Phone, Mail, MapPin, ShieldQuestion } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import pawPrintImage from "@assets/puppy paw print_1754361694595.png";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center">
              <img src={pawPrintImage} alt="Paw print" className="inline mr-2 h-5 w-5" />
              Parti Poodles Australia
            </h3>
            <p className="text-gray-300 mb-4">
              Dedicated to raising healthy, vibrant Standard Parti Poodles with stunning colors and patterns. 
              13+ years of breeding experience in Victoria, Australia.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/">
                  <span className="hover:text-white transition-colors duration-300 cursor-pointer" data-testid="footer-link-home">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-white transition-colors duration-300 cursor-pointer" data-testid="footer-link-about">
                    About
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/puppies">
                  <span className="hover:text-white transition-colors duration-300 cursor-pointer" data-testid="footer-link-puppies">
                    Available Puppies
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors duration-300 cursor-pointer" data-testid="footer-link-contact">
                    Contact
                  </span>
                </Link>
              </li>
            </ul>

            <h4 className="text-lg font-semibold mb-4 mt-6">Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="https://www.dogsvictoria.org.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-300"
                >
                  Dogs Victoria
                </a>
              </li>
              <li>
                <a
                  href="https://embarkvet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-300"
                >
                  Embark DNA Testing
                </a>
              </li>
              <li>
                <a
                  href="https://poodleclubvic.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-300"
                >
                  Poodle Club of Victoria
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center" data-testid="footer-location">
                <MapPin className="mr-2 h-4 w-4" />
                Mansfield, Victoria, Australia
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <a 
                  href="tel:+61498114541" 
                  className="hover:text-white transition-colors duration-300"
                  data-testid="footer-phone"
                >
                  +61 498 114 541
                </a>
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <a 
                  href="mailto:standardpartipoodlesaustralia@gmail.com" 
                  className="hover:text-white transition-colors duration-300 break-all"
                  data-testid="footer-email"
                >
                  standardpartipoodlesaustralia@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-300" data-testid="footer-copyright">
                &copy; 2024 Parti Poodles Australia. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Made with love by{" "}
                <a 
                  href="https://auswebites.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#B8956A] hover:text-white transition-colors duration-300"
                  data-testid="footer-auswebites-link"
                >
                  AusWebites.com
                </a>
              </p>
            </div>
            <div className="flex-shrink-0">
              {isAuthenticated ? (
                <Link href="/admin">
                  <Button className="text-xs px-3 py-1.5 bg-[#B8956A] hover:bg-[#A0825A] text-white border border-[#B8956A]" data-testid="button-admin-dashboard">
                    <ShieldQuestion className="mr-1 h-3 w-3" />
                    Puppy Portal
                  </Button>
                </Link>
              ) : (
                <Link href="/admin-login">
                  <Button className="text-xs px-3 py-1.5 bg-[#B8956A] hover:bg-[#A0825A] text-white border border-[#B8956A]" data-testid="button-admin-login">
                    <ShieldQuestion className="mr-1 h-3 w-3" />
                    Admin Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
