import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactForm from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function Contact() {
  useSEO({
    title: 'Contact Us - Enquire About Puppies',
    description: 'Contact Parti Poodles Australia to enquire about available Standard Parti Poodle puppies. Located in Mansfield, Victoria. Call +61 498 114 541.',
    canonical: '/contact'
  });

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Ready to welcome a Standard Parti Poodle into your family? We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">Get In Touch</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              We're here to help you find the perfect Standard Parti Poodle puppy for your family. Feel free to contact us with any questions about our available puppies, breeding program, or to schedule a visit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-800 mb-8">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600 mb-2">For the quickest response, please call us directly.</p>
                    <a href="tel:+61498114541" className="text-xl font-semibold text-primary hover:underline" data-testid="link-phone">
                      +61 498 114 541
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600 mb-2">We typically respond within 24 hours.</p>
                    <a href="mailto:standardpartipoodlesaustralia@gmail.com" className="text-lg font-semibold text-primary hover:underline break-all" data-testid="link-email">
                      standardpartipoodlesaustralia@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Location</h4>
                    <p className="text-gray-600 mb-2">Located in the beautiful high country of Victoria</p>
                    <p className="text-lg font-semibold text-primary">Mansfield, Victoria, Australia</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Visiting Hours</h4>
                    <p className="text-gray-600 mb-2">All visits must be scheduled in advance</p>
                    <p className="text-lg font-semibold text-primary">By appointment only</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="tel:+61498114541">
                  <Button className="btn-primary w-full sm:w-auto" data-testid="button-call-now">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </Button>
                </a>
                <a href="mailto:standardpartipoodlesaustralia@gmail.com">
                  <Button variant="outline" className="w-full sm:w-auto" data-testid="button-send-email">
                    <Mail className="mr-2 h-5 w-5" />
                    Send Email
                  </Button>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* What to Include Section */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">What to Include in Your Email</h2>
            <p className="text-lg text-gray-600">
              To help us provide the most helpful response, please include the following information in your inquiry:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📝 Your Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Your full name and contact phone number</li>
                <li>• Your location (city/state)</li>
                <li>• Best time to call you</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">🐕 What You're Looking For</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Gender preference (male/female/no preference)</li>
                <li>• Color preference (red, apricot/cream, sable, black, or no preference)</li>
                <li>• Timeline (ready now, 1-3 months, 3-6 months, flexible)</li>
                <li>• Specific puppy interest (if you've seen one you like on our website)</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🏠 About Your Family</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Tell us about your family (adults, children, ages)</li>
                <li>• Your living situation (house, apartment, yard size)</li>
                <li>• Previous experience with dogs or poodles</li>
                <li>• Why you're interested in a Standard Parti Poodle</li>
                <li>• Your lifestyle and activity level</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">❓ Any Questions</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Questions about our breeding program</li>
                <li>• Questions about specific puppies</li>
                <li>• Interest in scheduling a visit</li>
                <li>• Any other questions or concerns</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">How much do puppies cost?</h3>
                <p className="text-gray-600">Our Standard Parti Poodle puppies range from $2,500 - $3,500 AUD. This includes health testing, vaccinations, microchip, health guarantee, and lifetime breeder support.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">When are puppies ready to go home?</h3>
                <p className="text-gray-600">Puppies go to their new homes at 8 weeks of age, after they've been fully weaned, health checked, and received their first vaccinations.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Do you have a waiting list?</h3>
                <p className="text-gray-600">Yes, we maintain a waiting list for future litters. Contact us to be added to our list and receive updates about upcoming litters.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">What is your screening process?</h3>
                <p className="text-gray-600">We carefully screen all potential families to ensure our puppies go to loving, committed homes. This includes an application, phone interview, and sometimes a home visit.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Do you offer delivery?</h3>
                <p className="text-gray-600">We prefer pickup at our location in Mansfield, Victoria, but delivery may be available for an additional fee depending on the distance.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">What health guarantees do you provide?</h3>
                <p className="text-gray-600">All puppies come with a comprehensive 2-year genetic health guarantee covering hereditary conditions. Full details are provided in our puppy contract.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Located in Beautiful Mansfield, Victoria</h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              We're situated in the picturesque high country of Victoria, providing a perfect environment for raising healthy, happy Standard Parti Poodles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">About Our Location</h3>
              <p className="text-gray-300 mb-6">
                Mansfield is located in the foothills of the Victorian Alps, approximately 2 hours northeast of Melbourne. Our rural setting provides the perfect environment for raising Standard Parti Poodles with plenty of space to run and play.
              </p>
              <p className="text-gray-300 mb-6">
                The clean country air and peaceful surroundings contribute to the excellent health and temperament of our dogs. We believe the natural environment plays a crucial role in developing well-balanced, confident puppies.
              </p>

              <h4 className="text-xl font-semibold mb-4">Getting Here</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• 2 hours drive from Melbourne CBD</li>
                <li>• 1 hour from Shepparton</li>
                <li>• 45 minutes from Benalla</li>
                <li>• Easy access via Maroondah Highway</li>
              </ul>
            </div>

            <div className="bg-gray-700 p-8 rounded-xl">
              <h3 className="text-2xl font-serif font-bold mb-6">Visit by Appointment</h3>
              <p className="text-gray-300 mb-6">
                We welcome visits to meet our dogs and see our facilities. This is a great opportunity for you to:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Meet available puppies</li>
                <li>• See the parents of the litter</li>
                <li>• Tour our facilities</li>
                <li>• Ask questions in person</li>
                <li>• Get a feel for our breeding program</li>
              </ul>
              <div className="bg-gray-600 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Important:</strong> All visits must be scheduled in advance. We ask that visitors have not been in contact with other dogs or breeding facilities within 48 hours of their visit to protect the health of our puppies.
                </p>
              </div>
              <div className="mt-6">
                <a href="tel:+61498114541">
                  <Button className="btn-primary w-full" data-testid="button-schedule-visit">
                    <Phone className="mr-2 h-5 w-5" />
                    Call to Schedule
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
