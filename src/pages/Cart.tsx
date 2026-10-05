import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { configApi, errorMessage, productsApi, type StoreConfig } from '../api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNotify } from '../context/NotificationContext';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import SafeImage from '../components/SafeImage';
import { Spinner } from '../components/StateViews';

const Cart: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { formatPrice } = useTheme();
  const notify = useNotify();
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [busyLine, setBusyLine] = useState<string | null>(null);
  const { data: recommended } = useApi(() => productsApi.list({ featured: true, limit: 4, sort: 'best-selling' }), []);

  useEffect(() => {
    configApi.get().then(r => setConfig(r.data)).catch(() => undefined);
  }, []);

  const threshold = config?.freeShippingThreshold ?? 30000;
  const shippingCost = totalPrice === 0 || totalPrice >= threshold ? 0 : (config?.shippingFee ?? 1500);
  const finalTotal = totalPrice + shippingCost;
  const unavailable = items.filter(i => !i.available);

  const run = async (lineId: string, action: () => Promise<void>) => {
    setBusyLine(lineId);
    try {
      await action();
    } catch (err) {
      notify.error('Cart not updated', errorMessage(err));
    } finally {
      setBusyLine(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black py-12 md:py-16">
      <div className="luxury-container space-y-16">
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
          <div className="flex items-center gap-6">
            {items.length > 0 && (
              <button
                onClick={() => run('all', clearCart)}
                className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-red-400 transition-colors"
              >
                Clear Cart
              </button>
            )}
            <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300 flex items-center gap-2">
              <span>Continue Browsing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {loading && items.length === 0 ? <Spinner label="Loading cart" /> : items.length === 0 ? (
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
              <h2 className="text-xl md:text-2xl font-light text-white uppercase tracking-[0.15em]">Your Cart is Empty</h2>
            </div>
            <p className="text-brand-muted text-xs tracking-wide leading-relaxed max-w-md mx-auto">
              Your bag is currently empty. Explore our latest arrivals and add your favorite items.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300">
              Start Shopping
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {unavailable.length > 0 && (
                <div className="flex items-start gap-3 border border-amber-400/30 bg-amber-400/5 p-4 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Some items are sold out or no longer available in the quantity you chose. They won't be included in your order.</span>
                </div>
              )}
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className={`bg-brand-surface border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-opacity ${item.available ? 'border-white/6' : 'border-amber-400/30 opacity-70'} ${busyLine === item.id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <Link to={`/product/${item.slug || item.productId}`} className="w-20 h-24 flex-shrink-0 border border-white/8 overflow-hidden bg-brand-black">
                      <SafeImage src={item.image} alt={item.name} wrapperClassName="w-full h-full" className="w-full h-full object-cover" />
                    </Link>

                    <div className="space-y-1 min-w-0">
                      <Link to={`/product/${item.slug || item.productId}`} className="text-xs font-light text-white uppercase tracking-[0.15em] hover:text-brand-champagne block truncate">
                        {item.name}
                      </Link>
                      <div className="text-[10px] text-brand-muted uppercase tracking-[0.15em] flex items-center gap-3 flex-wrap">
                        {item.size && <span>Size: <strong className="text-white font-normal">{item.size}</strong></span>}
                        {item.size && item.color && <span>•</span>}
                        {item.color && <span>Color: <strong className="text-white font-normal">{item.color}</strong></span>}
                      </div>
                      <p className="text-xs font-light text-brand-champagne pt-1">
                        {formatPrice(item.unitPrice)}
                        {item.originalPrice > item.unitPrice && <span className="ml-2 text-brand-muted line-through">{formatPrice(item.originalPrice)}</span>}
                      </p>
                      {!item.available && (
                        <p className="text-[10px] text-amber-300 uppercase tracking-[0.12em]">
                          {item.stock > 0 ? `Only ${item.stock} left` : 'Sold out'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-white/6 pt-4 sm:pt-0">
                    <div className="flex items-center border border-white/12 bg-brand-black">
                      <button
                        onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity - 1))}
                        className="p-2 text-brand-muted hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-light text-white min-w-[28px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity + 1))}
                        disabled={item.quantity >= item.stock}
                        className="p-2 text-brand-muted hover:text-white transition-colors disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-brand-muted uppercase tracking-[0.15em] hidden sm:block">Subtotal</p>
                      <p className="text-xs font-light text-white">{formatPrice(item.lineTotal)}</p>
                    </div>

                    <button
                      onClick={() => run(item.id, () => removeFromCart(item.id))}
                      className="p-2 text-brand-muted hover:text-red-400 transition-colors duration-300"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

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
                    <span className="text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Estimated Shipping</span>
                    <span className="text-white">{shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}</span>
                  </div>
                  <p className="text-[10px] text-brand-muted">Coupons can be applied at checkout.</p>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-[0.2em] text-white">Total</span>
                    <span className="text-xl font-light text-brand-champagne">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {totalPrice > 0 && totalPrice < threshold && (
                  <div className="bg-brand-champagne/5 border border-brand-champagne/20 p-4">
                    <p className="text-[11px] text-brand-champagne tracking-wide text-center">
                      Add {formatPrice(threshold - totalPrice)} more for complimentary shipping
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  {totalPrice > 0 ? (
                    <Link
                      to="/checkout"
                      className="w-full flex items-center justify-center gap-3 bg-brand-canvas text-brand-black py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 group"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <p className="text-[11px] text-amber-300 text-center">None of the items in your cart can be ordered right now.</p>
                  )}
                  <Link to="/shop" className="block w-full py-3.5 border border-white/15 text-brand-muted hover:border-brand-champagne hover:text-brand-champagne text-xs uppercase tracking-[0.2em] transition-colors duration-300 text-center">
                    Continue Shopping
                  </Link>
                </div>

                <div className="pt-4 border-t border-white/6 flex items-center justify-center gap-2 text-[10px] text-brand-muted uppercase tracking-[0.15em]">
                  <ShieldCheck className="w-4 h-4 text-brand-champagne" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommended && recommended.length > 0 && (
          <div className="pt-8 border-t border-white/6 space-y-8">
            <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px] mb-1">Recommended</p>
                <h2 className="text-2xl font-light text-white uppercase tracking-[0.15em] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-champagne" />
                  Featured Additions
                </h2>
              </div>
              <Link to="/shop?featured=true" className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300">
                Explore Collection &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommended.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
