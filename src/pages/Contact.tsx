import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    // Simulate form submission
    console.log('Contact form submitted:', data);
    setIsSubmitted(true);
    reset();
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <p className="text-slate-600 mb-8">
                Have a question, suggestion, or just want to say hello? We're here to help and would love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Visit Our Store</h3>
                  <p className="text-slate-600">
                    123 Fashion Street<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                  <p className="text-slate-600">
                    +1 (555) 123-4567<br />
                    Mon-Fri 9AM-6PM EST
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                  <p className="text-slate-600">
                    hello@cstyle.com<br />
                    support@cstyle.com
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Store Hours</h3>
                  <div className="text-slate-600 space-y-1">
                    <p>Monday - Friday: 10AM - 8PM</p>
                    <p>Saturday: 10AM - 6PM</p>
                    <p>Sunday: 12PM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                  <span className="text-sm font-bold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                  <span className="text-sm font-bold">ig</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                  <span className="text-sm font-bold">tw</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Thank you for your message! We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <select
                    {...register('subject', { required: 'Please select a subject' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="returns">Returns & Exchanges</option>
                    <option value="sizing">Sizing Help</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="press">Press & Media</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                  {
                    question: "What is your return policy?",
                    answer: "We offer a 30-day return policy for all items in original condition with tags attached."
                  },
                  {
                    question: "How long does shipping take?",
                    answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days."
                  },
                  {
                    question: "Do you offer international shipping?",
                    answer: "Yes, we ship to over 25 countries worldwide. Shipping costs and times vary by destination."
                  },
                  {
                    question: "How do I track my order?",
                    answer: "You'll receive a tracking number via email once your order ships. You can track it on our website or the carrier's site."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">{faq.question}</h4>
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Find Our Store</h2>
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">Interactive map would be displayed here</p>
            </div>
            <div className="mt-4 text-center">
              <p className="text-slate-600">
                Visit our flagship store in the heart of NYC's fashion district.
                <br />
                <strong>123 Fashion Street, New York, NY 10001</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;