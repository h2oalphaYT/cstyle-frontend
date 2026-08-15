import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const orderNumber = `CS${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  return (
    <div className="min-h-screen bg-brand-black py-20 flex items-center justify-center">
      <div className="luxury-container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Main Card */}
          <div className="bg-brand-surface border border-white/6 p-10 md:p-12 text-center space-y-8">
            {/* Success Icon */}
            <div className="w-16 h-16 border border-brand-champagne/40 bg-brand-black flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-brand-champagne" />
            </div>

            {/* Header */}
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs mb-2">Order Confirmed</p>
              <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-3">
                Thank You For Your Order
              </h1>
              <p className="text-brand-muted text-xs tracking-wide max-w-md mx-auto leading-relaxed">
                Your purchase has been placed successfully and our atelier is now preparing your items.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-brand-black border border-white/6 p-6 text-left space-y-4 text-xs tracking-wide">
              <div className="flex justify-between items-center pb-2 border-b border-white/6">
                <span className="text-brand-muted uppercase tracking-[0.15em] text-[10px]">Order Number</span>
                <span className="text-brand-champagne font-light tracking-wider">#{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/6">
                <span className="text-brand-muted uppercase tracking-[0.15em] text-[10px]">Order Date</span>
                <span className="text-white font-light">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted uppercase tracking-[0.15em] text-[10px]">Estimated Delivery</span>
                <span className="text-white font-light">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-left space-y-4 pt-2">
              <p className="text-[10px] text-brand-champagne uppercase tracking-[0.25em]">Fulfillment Timeline</p>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Order Processing', desc: 'Crafting & inspecting items for dispatch.' },
                  { step: '2', title: 'Shipping Confirmation', desc: 'You will receive a tracking code via email.' },
                  { step: '3', title: 'Express Delivery', desc: 'Your parcel arrives within 3-5 business days.' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-6 h-6 border border-brand-champagne/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-brand-champagne text-[10px]">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-xs font-light text-white uppercase tracking-[0.15em]">{item.title}</p>
                      <p className="text-[11px] text-brand-muted tracking-wide mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Notification */}
            <div className="flex items-center justify-center gap-2.5 text-[11px] text-brand-muted bg-brand-black border border-white/6 p-3">
              <Mail className="w-3.5 h-3.5 text-brand-champagne" />
              <span>A detailed confirmation email has been dispatched to your address.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/shop" className="flex-1">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-brand-canvas text-brand-black py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 group"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <button className="py-4 px-6 border border-white/15 text-brand-muted hover:border-brand-champagne hover:text-brand-champagne text-xs uppercase tracking-[0.2em] transition-colors duration-300 flex items-center justify-center gap-2">
                <Package className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;