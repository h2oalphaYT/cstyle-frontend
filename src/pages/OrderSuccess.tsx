import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Landmark } from 'lucide-react';
import type { Order } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const BANK_DETAILS = (import.meta.env.VITE_BANK_DETAILS as string | undefined)?.replace(/\\n/g, '\n');

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useTheme();

  // Reached directly (refresh / bookmark) without a just-placed order.
  if (!order) return <Navigate to={isAuthenticated ? '/account' : '/shop'} replace />;

  const placed = new Date(order.createdAt);
  const eta = new Date(placed.getTime() + 5 * 24 * 60 * 60 * 1000);
  const dateFmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="min-h-screen bg-brand-black py-20 flex items-center justify-center">
      <div className="luxury-container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="bg-brand-surface border border-white/6 p-6 sm:p-10 md:p-12 text-center space-y-8">
            <div className="w-16 h-16 border border-brand-champagne/40 bg-brand-black flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-brand-champagne" />
            </div>

            <div>
              <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs mb-2">Order Placed</p>
              <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-3">
                Thank You For Your Order
              </h1>
              <p className="text-brand-muted text-xs tracking-wide max-w-md mx-auto leading-relaxed">
                We've received your order, {order.customer.name.split(' ')[0]}. Keep your order number to track it.
              </p>
            </div>

            <div className="bg-brand-black border border-white/6 p-6 text-left space-y-4 text-xs tracking-wide">
              {[
                ['Order Number', <span className="text-brand-champagne font-light tracking-wider">#{order.orderNumber}</span>],
                ['Order Date', placed.toLocaleDateString('en-US', dateFmt)],
                ['Payment', order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'],
                ['Estimated Delivery', eta.toLocaleDateString('en-US', dateFmt)],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between items-center pb-2 border-b border-white/6 last:border-0 gap-4">
                  <span className="text-brand-muted uppercase tracking-[0.15em] text-[10px]">{label}</span>
                  <span className="text-white font-light text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="text-left space-y-3">
              <p className="text-[10px] text-brand-champagne uppercase tracking-[0.25em]">Items</p>
              {order.items.map(item => (
                <div key={item._id} className="flex justify-between text-xs text-brand-muted gap-4">
                  <span className="truncate">{item.quantity} × {item.name}{item.size ? ` (${[item.size, item.color].filter(Boolean).join(' / ')})` : ''}</span>
                  <span className="text-white flex-shrink-0">{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
              <div className="border-t border-white/6 pt-3 space-y-1.5 text-xs">
                {order.discount > 0 && <div className="flex justify-between text-emerald-300"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>}
                <div className="flex justify-between text-brand-muted"><span>Shipping</span><span className="text-white">{order.shipping ? formatPrice(order.shipping) : 'Complimentary'}</span></div>
                <div className="flex justify-between text-white uppercase tracking-[0.15em]"><span>Total</span><span className="text-brand-champagne">{formatPrice(order.total)}</span></div>
              </div>
            </div>

            {order.paymentMethod === 'bank_transfer' && (
              <div className="text-left flex gap-3 border border-brand-champagne/30 bg-brand-champagne/5 p-4 text-xs text-brand-muted leading-relaxed">
                <Landmark className="w-4 h-4 text-brand-champagne flex-shrink-0 mt-0.5" />
                <div>
                  {BANK_DETAILS ? (
                    <>
                      <p className="text-white mb-1">Please transfer {formatPrice(order.total)} to:</p>
                      <p className="whitespace-pre-line">{BANK_DETAILS}</p>
                    </>
                  ) : (
                    <p>Our team will contact you on {order.customer.phone} with bank details.</p>
                  )}
                  <p className="mt-2">Use <span className="text-brand-champagne">{order.orderNumber}</span> as the payment reference.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/shop" className="flex-1 flex items-center justify-center gap-2 bg-brand-canvas text-brand-black py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 group">
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={isAuthenticated ? `/account/orders/${order.id}` : '/track-order'}
                state={isAuthenticated ? undefined : { orderNumber: order.orderNumber, email: order.customer.email }}
                className="py-4 px-6 border border-white/15 text-brand-muted hover:border-brand-champagne hover:text-brand-champagne text-xs uppercase tracking-[0.2em] transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
