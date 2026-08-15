import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const Cart: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  const recommendedProducts = products.filter(p => p.isNew || p.isFeatured).slice(0, 4);

  const shippingCost = totalPrice >= 30000 ? 0 : 1500;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shippingCost + tax;

  return (
    <div className="min-h-screen bg-brand-black py-12 md:py-16">
      <div className="luxury-container space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-white/6 pb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div>
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-2">Shopping Bag</p>
            <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">
              Your Selection ({totalItems})
            </h1>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300 flex items-center gap-2"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Empty Cart State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl mx-auto text-center bg-brand-surface border border-white/6 p-10 md:p-12 space-y-6"
          >
            <div className="w-14 h-14 border border-brand-champagne/30 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6 text-brand-champagne" />
            </div>
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px] mb-1">Shopping Bag</p>
              <h2 className="text-xl md:text-2xl font-light text-white uppercase tracking-[0.15em]">
                Your Cart is Empty
              </h2>
            </div>
            <p className="text-brand-muted text-xs tracking-wide leading-relaxed max-w-md mx-auto">
              Your bag is currently empty. Explore our latest arrivals and add your favorite items.
            </p>
            <Link to="/shop">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300"
              >
                Start Shopping
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="bg-brand-surface border border-white/6 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-20 h-24 flex-shrink-0 border border-white/8 overflow-hidden bg-brand-black">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-light text-white uppercase tracking-[0.15em]">
                        {item.name}
                      </h3>
                      <div className="text-[10px] text-brand-muted uppercase tracking-[0.15em] flex items-center gap-3">
                        <span>Size: <strong className="text-white font-normal">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-white font-normal">{item.color}</strong></span>
                      </div>
                      <p className="text-xs font-light text-brand-champagne pt-1">
                        Rs {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-white/6 pt-4 sm:pt-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-white/12 bg-brand-black">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        className="p-2 text-brand-muted hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-light text-white min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        className="p-2 text-brand-muted hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-[10px] text-brand-muted uppercase tracking-[0.15em] hidden sm:block">Subtotal</p>
                      <p className="text-xs font-light text-white">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className="p-2 text-brand-muted hover:text-red-400 transition-colors duration-300"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-brand-surface border border-white/6 p-8 sticky top-28 space-y-6">
                <div>
                  <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Overview</p>
                  <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Order Summary</h2>
                  <div className="h-px w-8 bg-brand-champagne mt-3" />
                </div>

                <div className="space-y-4 text-xs tracking-wide">
                  <div className="flex justify-between text-brand-muted">
                    <span>Items Subtotal</span>
                    <span className="text-white">Rs {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Estimated Shipping</span>
                    <span className="text-white">
                      {shippingCost === 0 ? 'Complimentary' : `Rs ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Estimated Tax (8%)</span>
                    <span className="text-white">Rs {tax.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-[0.2em] text-white">Total</span>
                    <span className="text-xl font-light text-brand-champagne">
                      Rs {finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {totalPrice < 30000 && (
                  <div className="bg-brand-champagne/5 border border-brand-champagne/20 p-4">
                    <p className="text-[11px] text-brand-champagne tracking-wide text-center">
                      Add Rs {(30000 - totalPrice).toLocaleString()} more for complimentary shipping
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Link to="/checkout" className="block w-full">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-3 bg-brand-canvas text-brand-black py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 group"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>

                  <Link to="/shop" className="block w-full">
                    <button className="w-full py-3.5 border border-white/15 text-brand-muted hover:border-brand-champagne hover:text-brand-champagne text-xs uppercase tracking-[0.2em] transition-colors duration-300 text-center">
                      Continue Shopping
                    </button>
                  </Link>
                </div>

                {/* Security info */}
                <div className="pt-4 border-t border-white/6 flex items-center justify-center gap-2 text-[10px] text-brand-muted uppercase tracking-[0.15em]">
                  <ShieldCheck className="w-4 h-4 text-brand-champagne" />
                  <span>Encrypted &amp; Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curated Recommendations Section (Fills page when empty or filled) */}
        <div className="pt-8 border-t border-white/6 space-y-8">
          <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px] mb-1">Recommended</p>
              <h2 className="text-2xl font-light text-white uppercase tracking-[0.15em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-champagne" />
                Featured Additions
              </h2>
            </div>
            <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300">
              Explore Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;