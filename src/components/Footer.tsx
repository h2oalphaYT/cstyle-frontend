import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-slate-900 text-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">cS</span>
              </div>
              <span className="text-2xl font-bold">cStyle</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Premium fashion for the modern lifestyle. Discover quality clothing that combines style, comfort, and sustainability.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Men" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Women" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Kids" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Kids Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-300 text-sm">123 Fashion Street</p>
                  <p className="text-slate-300 text-sm">New York, NY 10001</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <p className="text-slate-300 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-slate-300 text-sm">hello@cstyle.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-300 text-sm mb-4">
              Subscribe to our newsletter for the latest fashion trends and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="bg-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2025 cStyle. All rights reserved.
          </p>

          {/* Admin Access Button */}
          <Link to="/admin">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-bold text-sm rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transition-all flex items-center space-x-3 group"
            >
              <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide">Admin Dashboard</span>
              <span className="text-xs opacity-75">⚡</span>
            </motion.button>
          </Link>

          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full shadow-2xl hover:shadow-amber-500/50 flex items-center justify-center group cursor-pointer backdrop-blur-sm border-2 border-amber-400/30"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;