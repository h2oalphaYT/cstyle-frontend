import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      email: user?.email || '',
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      country: 'LK'
    }
  });

  const subtotal = totalPrice;
  const shipping = subtotal >= 30000 ? 0 : 1500;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    setTimeout(() => {
      clearCart();
      navigate('/order-success');
      setIsProcessing(false);
    }, 2500);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const inputClass =
    'w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-sm placeholder-white/20 focus:outline-none transition-colors duration-300';

  const labelClass =
    'block text-[10px] font-medium text-brand-muted mb-1.5 uppercase tracking-[0.2em]';

  return (
    <div className="min-h-screen bg-brand-black py-16">
      <div className="luxury-container max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-8 border-b border-white/6"
        >
          <div>
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-2">Secure Payment</p>
            <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">
              Checkout
            </h1>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </button>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-10">
            {/* Contact Information */}
            <div className="bg-brand-surface border border-white/6 p-8 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Step 1</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Contact Information</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>

              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className={inputClass}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-brand-surface border border-white/6 p-8 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Step 2</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Shipping Details</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Delivery Address *</label>
                  <input
                    {...register('address', { required: 'Address is required' })}
                    type="text"
                    className={inputClass}
                    placeholder="Street address or P.O. Box"
                  />
                  {errors.address && (
                    <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>State / Province *</label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Postal Code *</label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="Postal Code"
                    />
                    {errors.zipCode && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Country *</label>
                  <select
                    {...register('country', { required: 'Country is required' })}
                    className={`${inputClass} cursor-pointer appearance-none`}
                  >
                    <option value="LK" className="bg-brand-black">Sri Lanka</option>
                    <option value="US" className="bg-brand-black">United States</option>
                    <option value="CA" className="bg-brand-black">Canada</option>
                    <option value="UK" className="bg-brand-black">United Kingdom</option>
                    <option value="AU" className="bg-brand-black">Australia</option>
                  </select>
                  {errors.country && (
                    <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-brand-surface border border-white/6 p-8 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Step 3</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-champagne" />
                  Payment Details
                </h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Name on Card *</label>
                  <input
                    {...register('nameOnCard', { required: 'Name on card is required' })}
                    type="text"
                    className={inputClass}
                    placeholder="Full name as printed on card"
                  />
                  {errors.nameOnCard && (
                    <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.nameOnCard.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Card Number *</label>
                  <input
                    {...register('cardNumber', {
                      required: 'Card number is required',
                      pattern: {
                        value: /^[0-9\s]{13,19}$/,
                        message: 'Please enter a valid card number'
                      }
                    })}
                    type="text"
                    className={inputClass}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Expiry Date *</label>
                    <input
                      {...register('expiryDate', {
                        required: 'Expiry date is required',
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                          message: 'Please enter MM/YY format'
                        }
                      })}
                      type="text"
                      className={inputClass}
                      placeholder="MM/YY"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>CVV *</label>
                    <input
                      {...register('cvv', {
                        required: 'CVV is required',
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: 'Please enter a valid CVV'
                        }
                      })}
                      type="text"
                      className={inputClass}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center text-[10px] text-brand-muted uppercase tracking-[0.15em] gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-champagne" />
                  <span>256-Bit SSL Encrypted & Secure Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brand-surface border border-white/6 p-8 sticky top-28 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Summary</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Your Order</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>

              {/* Order Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-4 py-2 border-b border-white/6 last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-light text-white uppercase tracking-wide truncate">{item.name}</h4>
                      <p className="text-[10px] text-brand-muted uppercase tracking-wider">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-light text-brand-champagne flex-shrink-0">
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 pt-4 border-t border-white/10 text-xs tracking-wide">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span className="text-white">Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Shipping</span>
                  <span className="text-white">
                    {shipping === 0 ? 'Complimentary' : `Rs ${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-white">Rs {tax.toLocaleString()}</span>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-[0.2em] text-white">Total</span>
                  <span className="text-xl font-light text-brand-champagne">
                    Rs {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isProcessing}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-brand-canvas text-brand-black py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-black mr-2"></div>
                    Processing Payment…
                  </>
                ) : (
                  `Complete Order • Rs ${total.toLocaleString()}`
                )}
              </motion.button>

              <p className="text-[10px] text-brand-muted text-center tracking-wide leading-relaxed">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;