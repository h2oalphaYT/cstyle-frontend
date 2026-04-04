import React from 'react';
import { Award, Users, Leaf, Globe, Heart, Star } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 hero-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              About cStyle
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 mb-8">
              Premium fashion for the modern lifestyle. We craft quality clothing that combines style, comfort, and sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Founded in 2020, cStyle emerged from a simple vision: to create fashion that doesn't compromise on quality, style, or sustainability. We believe that great clothing should tell a story – your story.
                </p>
                <p>
                  As a premium garment manufacturer, we've built our reputation on delivering A-grade quality clothing that stands the test of time. Every piece is carefully crafted with attention to detail, using sustainable materials and ethical manufacturing practices.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide, offering collections that celebrate individuality while promoting conscious consumption and environmental responsibility.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=600"
                alt="Fashion design process"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg shadow-lg p-8 card-hover">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Our Mission</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                To democratize premium fashion by making high-quality, sustainable clothing accessible to everyone. We strive to create pieces that empower individuals to express their unique style while making responsible choices for our planet.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 card-hover">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Our Vision</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                To become the world's most trusted fashion brand, known for exceptional quality, innovative design, and unwavering commitment to sustainability. We envision a future where fashion enhances lives without harming our environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These principles guide everything we do, from design to delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quality First</h3>
              <p className="text-slate-600">
                We never compromise on quality. Every garment undergoes rigorous testing to ensure it meets our A-grade standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sustainability</h3>
              <p className="text-slate-600">
                Environmental responsibility is at our core. We use eco-friendly materials and sustainable manufacturing processes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community</h3>
              <p className="text-slate-600">
                We believe in building strong relationships with our customers, partners, and the communities we serve.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Impact</h3>
              <p className="text-slate-600">
                We're committed to making a positive impact globally through fair trade practices and ethical manufacturing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Commitment */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=600"
                alt="Sustainable fashion"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <Leaf className="w-12 h-12 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Sustainable Fashion Commitment
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Eco-Friendly Materials</h4>
                    <p className="text-slate-600">We source organic cotton, recycled polyester, and other sustainable materials for our garments.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Ethical Manufacturing</h4>
                    <p className="text-slate-600">All our manufacturing partners adhere to fair labor practices and safe working conditions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Carbon Neutral Shipping</h4>
                    <p className="text-slate-600">We offset 100% of our shipping emissions through verified carbon reduction projects.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Circular Fashion</h4>
                    <p className="text-slate-600">We encourage recycling and offer take-back programs for worn-out garments.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-amber-500 mb-2">50K+</div>
              <div className="text-slate-300">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-amber-500 mb-2">100K+</div>
              <div className="text-slate-300">Products Sold</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-amber-500 mb-2">25+</div>
              <div className="text-slate-300">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-amber-500 mb-2">4.8</div>
              <div className="text-slate-300">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The passionate people behind cStyle's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=300',
                bio: 'Fashion industry veteran with 15+ years of experience in sustainable design and manufacturing.'
              },
              {
                name: 'Michael Chen',
                role: 'Head of Design',
                image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=300',
                bio: 'Award-winning designer passionate about creating timeless pieces that blend style with functionality.'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Sustainability Director',
                image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=300',
                bio: 'Environmental scientist dedicated to making fashion more sustainable and ethical.'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden card-hover">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-amber-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Join the Cstyle Community
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Experience the perfect blend of style, quality, and sustainability. Shop our latest collections and become part of the fashion revolution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="btn-primary px-8 py-4 text-lg">
              Shop Now
            </button>
            <button className="btn-outline px-8 py-4 text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;