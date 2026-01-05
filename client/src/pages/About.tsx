import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Heart, Stethoscope, Home, Thermometer, Users, Award, Dna, TestTube, Shield } from "lucide-react";
import pawPrintImage from "@assets/puppy paw print_1754361694595.png";

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-light">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-brown-50 to-primary/10 py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Heart size={80} className="text-primary" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <img src={pawPrintImage} alt="Paw print" className="w-16 h-16" />
        </div>
        <div className="absolute top-20 right-20 opacity-10">
          <Stethoscope size={70} className="text-primary" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-primary/10 rounded-full px-6 py-2 mb-6">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Story</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-gray-800 mb-6 leading-tight">
            About <span className="text-primary">Our Journey</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Meet your breeder and discover our story, philosophy, and passion for Standard Parti Poodles.
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-primary to-brown-600 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Early Years Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6">
                <Stethoscope className="text-primary mr-2" size={20} />
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Beginning</span>
              </div>
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">Early Years in a Vet Clinic</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="mb-6 text-lg">
                  Hello to all those wonderful poodle loving humans. You may already have one of my beautiful parti poodles 
                  or are looking at acquiring one in the future, but here is a little bit of history about me and how I ended 
                  up breeding these wonderfully intelligent, intuitive and gorgeous creatures.
                </p>
                <p className="mb-6">
                  I grew up with my siblings in my father's vet clinic where I spent most of my spare time. I had three favourite places. 
                  I was either on my horse which I rode for hours most days including the 8km ride to school and home again every day. 
                  Or I was in the old Toyota tracking around with dad to all the district's farms even at 2am in the cold, wet, snow 
                  of winter with freezing fingers holding the torch, instrument tray or the medicines to help pull a calf out of a cow 
                  having trouble giving birth. Or I was in the clinic holding up veins on dog's front legs so dad could easily perform 
                  an IV which I would then lift my fingers once the needle slid in.
                </p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg">
                  <blockquote className="text-center">
                    <div className="text-primary mb-4">
                      <Heart size={48} className="mx-auto" />
                    </div>
                    <p className="text-xl font-serif italic text-gray-700 mb-4">
                      "From vet clinic to breeding excellence - a lifetime dedicated to dogs"
                    </p>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                  </blockquote>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Family Memories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Family Memories and Puppy Beginnings</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6">
              However my fondest memories are those of all of us kids and mum having been called in to do a caesarean section 
              on a dog. As dad would begin to pull out one puppy at a time, we all had a towel ready for each puppy and would 
              be instructed to rub up and down their tiny limp bodies between our hands with the towel quite rigorously until 
              we heard a squeak. "KEEP RUBBING" dad would say. Our little kid arms burning with the effort but never stopping 
              until the little puppy was squirming and squealing in our little hands.
            </p>
            <p className="mb-6">
              We always had hunting dogs, sheep dogs, Blue heelers and terriers. We spent so much time with them and especially 
              when sometimes as kids we would discover a litter in a kennel. How we were never bitten by the hunting hounds as 
              we used to spend hours sitting in these kennels with all the puppies completely oblivious to the dangers that 
              these over protective mums never turned their protective instincts on us.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="bg-primary rounded-3xl shadow-xl p-12 text-white relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-brown-600/20 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brown-600/20 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="group">
                <div className="bg-brown-600/30 rounded-2xl p-6 transition-all duration-300 group-hover:bg-brown-600/40">
                  <div className="text-5xl font-bold mb-3">16+</div>
                  <div className="text-lg font-medium">Years of Experience</div>
                  <Award className="mx-auto mt-4" size={32} />
                </div>
              </div>
              <div className="group">
                <div className="bg-brown-600/30 rounded-2xl p-6 transition-all duration-300 group-hover:bg-brown-600/40">
                  <div className="text-5xl font-bold mb-3">100+</div>
                  <div className="text-lg font-medium">Happy Families</div>
                  <Users className="mx-auto mt-4" size={32} />
                </div>
              </div>
              <div className="group">
                <div className="bg-brown-600/30 rounded-2xl p-6 transition-all duration-300 group-hover:bg-brown-600/40">
                  <div className="text-5xl font-bold mb-3">All Clear</div>
                  <div className="text-lg font-medium">Health Testing</div>
                  <Shield className="mx-auto mt-4" size={32} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Standard Poodle Discovery */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Discovering the Standard Poodle</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
            <p className="mb-6">
              As a teenager I had a GSP called Sunday and I also trained a couple of sheepdogs. It was at a sheepdog clinic 
              I asked the instructor what his first dog was. He said "A STANDARD POODLE". Everyone gasped that "OH NO! SURELY 
              NOT A POODLE?" Anyway he could sense everyone's sliding opinion of him so he told his story of how someone had 
              advised him that he should get a Standard Poodle as his first dog as they are intelligent, loyal, loving but 
              also so very VERSATILE. He said it was the best dog he ever had. I was hooked.
            </p>
            <p className="mb-6">
              I then after doing a little researching discovered there were coloured ones called "parti". Of course 15-16 years 
              ago there was none in Australia. So I looked further afield and over a couple of years sourced Passion and Kiwi 
              from New Zealand which were my first two parti poodles. And now 16 years later I breed Standard Poodles for 
              others so they too can experience these beautiful dogs and all they have to offer.
            </p>
          </div>

          {/* Why Standard Parti Poodles */}
          <div className="bg-gradient-to-r from-primary/10 to-brown-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Heart className="mr-3 text-primary" />
              Why Standard Parti Poodles?
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-3">•</span>
                Intelligent and highly trainable
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3">•</span>
                Loyal and loving family companions
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3">•</span>
                Versatile - great for all lifestyles
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3">•</span>
                Unique and beautiful parti coloring
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3">•</span>
                Hypoallergenic coat
              </li>
            </ul>
          </div>
        </section>

        {/* Breeding Philosophy */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Our Breeding Philosophy & Practices</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
            <p className="mb-6">
              As a breeder I absolutely do my best to try breed the best natured and most well put together poodles in the country. 
              It has been a long journey with amazing results. Every dog I intend to breed is DNA tested with Embark USA which is 
              an incredibly extensive test of the genetic makeup of the dog. All my dogs are ALL CLEAR in all diseases testable to 
              ensure the best quality and peace of mind to anyone acquiring a puppy. Also parents are all hip tested and scored 
              and will only be bred with if they meet recommendations.
            </p>
          </div>

          {/* Breeding Practices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 rounded-full p-3 mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <TestTube className="text-primary" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">DNA Testing</h3>
                  <div className="w-12 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">Comprehensive Embark USA testing ensures genetic health and quality</p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 rounded-full p-3 mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Home className="text-primary" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Home Raised</h3>
                  <div className="w-12 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">First 3 weeks in my bedroom for close monitoring and care</p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 rounded-full p-3 mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Thermometer className="text-primary" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Puppy Hut</h3>
                  <div className="w-12 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">Climate controlled environment with heated floors year-round</p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 rounded-full p-3 mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Users className="text-primary" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Socialization</h3>
                  <div className="w-12 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">Raised with family & friends for optimal social development</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6">
              The mums are very precious and spend the two weeks prior to giving birth in my bedroom with me where they stay 
              for three weeks after the puppies are born ensuring I can keep a close eye on them in this very infant stage. 
              Not much sleep with the squeaking and snuffling but never can I be separated in this very vulnerable time. Its worth it.
            </p>
            <p className="mb-6">
              The puppies then move to live out in what I call the "puppy hut" which is a timber lined shed with heated floors 
              and a split system to ensure constant temp whether summer or winter. From here they have full access to outside 
              when they are ready which is about 3 ½ weeks and they really begin their own toilet training. By four weeks they 
              are venturing out to do their business on the grass outside their puppy hut.
            </p>
          </div>
        </section>

        {/* Future Plans */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Looking into the Future</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6">
              This year I have for the first time acquired three dogs who carry red. One of them is a Royal (Giant) Poodle, 
              so for those who like BIG dogs I will hopefully be able to breed some puppies on the larger side with some really 
              cool colours. I am in the process of rehoming about 5 of my adult dogs, something I do when they get to about 2-3 years old.
            </p>
            <p className="mb-6">
              I generally only let my girls have 1-2 litters before I place them with a new family. I think they deserve this. 
              The boys I might occasionally keep a little longer or even younger. It really depends on many different factors. 
              I definitely keep a very diverse genetic pool and steer well clear of line breeding. The health of my dogs is very 
              important to me as I hope to pass each of you a healthy puppy which will live out long years in the family who have 
              adopted him/her with as few health issues as possible.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative text-center bg-gray-800 text-white rounded-3xl p-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-brown-600/20 rounded-full translate-x-24 translate-y-24"></div>
          
          <div className="relative">
            <div className="inline-block bg-primary/80 rounded-full px-6 py-2 mb-6">
              <span className="font-semibold text-sm uppercase tracking-wider text-white">Get Started</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">Ready to Meet Your New Best Friend?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-200">
              Our puppies are raised with love, care, and the highest standards of breeding excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/puppies" 
                className="group bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                data-testid="button-view-available-puppies"
              >
                <span className="flex items-center justify-center">
                  <Heart className="mr-2 group-hover:scale-110 transition-transform duration-300" size={20} />
                  View Available Puppies
                </span>
              </a>
              <a 
                href="/contact" 
                className="group border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                data-testid="button-contact-breeder"
              >
                <span className="flex items-center justify-center">
                  <Users className="mr-2 group-hover:scale-110 transition-transform duration-300" size={20} />
                  Contact Us
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}