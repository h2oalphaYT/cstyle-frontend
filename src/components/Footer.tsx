import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { CONTACT, telHref } from '../config/store';
import { errorMessage, http } from '../api/client';
import { useNotify } from '../context/NotificationContext';

const Footer: React.FC = () => {
  const notify = useNotify();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await http.post('/newsletter', { email: newsletterEmail });
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    } catch (err) {
      notify.error('Subscription failed', errorMessage(err));
    }
  };

  return (
    // Bottom padding leaves room for the floating back-to-top button so it never covers text.
    <footer className="bg-cs-bg text-cs-text relative border-t border-cs-border pt-16 pb-24 lg:pb-12">
      <div className="luxury-container">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/6">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 border border-brand-champagne flex items-center justify-center bg-brand-black">
                <span className="text-brand-champagne font-light text-xs tracking-widest">cS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-light tracking-[0.25em] text-white uppercase leading-none">cStyle</span>
                <span className="text-[8px] tracking-[0.3em] text-brand-champagne uppercase font-light mt-1">Sri Lanka</span>
              </div>
            </div>

            <p className="text-brand-muted text-xs tracking-wide leading-relaxed">
              Crafting A-grade luxury garments with timeless Sri Lankan elegance, premium fabrics, and conscious sustainability.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 pt-1">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Twitter, href: '#' }
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  aria-label={['Facebook', 'Instagram', 'Twitter'][idx]}
                  className="w-11 h-11 border border-white/12 flex items-center justify-center text-brand-muted hover:border-brand-champagne hover:text-brand-champagne transition-colors duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.25em] text-[9px] mb-1">Navigation</p>
              <h3 className="text-xs font-light text-white uppercase tracking-[0.22em]">Quick Links</h3>
              <div className="h-px w-6 bg-brand-champagne mt-2" />
            </div>

            <ul className="space-y-3 text-xs tracking-wide">
              <li>
                <Link to="/shop" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Shop Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=men" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Men&apos;s Apparel
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=women" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Women&apos;s Apparel
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=kids" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Kids Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-5">
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.25em] text-[9px] mb-1">Support</p>
              <h3 className="text-xs font-light text-white uppercase tracking-[0.22em]">Customer Care</h3>
              <div className="h-px w-6 bg-brand-champagne mt-2" />
            </div>

            <ul className="space-y-3 text-xs tracking-wide">
              <li>
                <a href="#" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Returns &amp; Exchanges
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-brand-muted hover:text-white uppercase tracking-[0.15em] transition-colors duration-300">
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.25em] text-[9px] mb-1">Atelier</p>
              <h3 className="text-xs font-light text-white uppercase tracking-[0.22em]">Location &amp; Contact</h3>
              <div className="h-px w-6 bg-brand-champagne mt-2" />
            </div>

            <div className="space-y-4 text-xs text-brand-muted tracking-wide">
              <address className="not-italic flex items-start space-x-3">
                <MapPin className="w-3.5 h-3.5 text-brand-champagne flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{CONTACT.company}<br />{CONTACT.addressLines.join(', ')}</span>
              </address>
              {CONTACT.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-3.5 h-3.5 text-brand-champagne flex-shrink-0" />
                  <a href={telHref(CONTACT.phone)} className="hover:text-white">{CONTACT.phone}</a>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Mail className="w-3.5 h-3.5 text-brand-champagne flex-shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Banner */}
        <div className="py-12 border-b border-white/6">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px]">Privilege Club</p>
            <h3 className="text-xl font-light text-white uppercase tracking-[0.15em]">Stay Connected</h3>
            <p className="text-brand-muted text-xs tracking-wide">
              Subscribe to receive private invitations to new collection launches and editorial offers.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="enter your email address"
                aria-label="Email address"
                className="flex-1 px-4 py-3 bg-transparent border-b border-white/20 focus:border-brand-champagne text-white text-xs placeholder-white/40 focus:outline-none transition-colors duration-300"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-brand-canvas text-brand-black px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 flex-shrink-0"
              >
                {subscribed ? 'Subscribed' : 'Join'}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-brand-muted text-[11px] uppercase tracking-[0.15em]">
            &copy; {new Date().getFullYear()} cStyle Atelier. All rights reserved.
          </p>

          <div className="flex space-x-6 text-[11px] uppercase tracking-[0.15em] text-brand-muted">
            <a href="#" className="hover:text-brand-champagne transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-brand-champagne transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;