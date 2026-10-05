import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Tag, X, Banknote, Landmark } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { errorMessage, ordersApi, type PaymentMethod, type Quote } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotify } from '../context/NotificationContext';
import SafeImage from '../components/SafeImage';
import { Spinner } from '../components/StateViews';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
}

const Checkout: React.FC = () => {
  const { items, clearCart, toLineInputs, loading: cartLoading, refresh } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useTheme();
  const notify = useNotify();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [couponBusy, setCouponBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [firstName = '', ...rest] = (defaultAddress?.fullName || user?.name || '').split(' ');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      email: user?.email || '',
      firstName,
      lastName: rest.join(' '),
      phone: defaultAddress?.phone || user?.phone || '',
      address: defaultAddress?.line1 || '',
      address2: defaultAddress?.line2 || '',
      city: defaultAddress?.city || '',
      state: defaultAddress?.state || '',
      zipCode: defaultAddress?.postalCode || '',
      country: defaultAddress?.country || 'Sri Lanka',
      notes: '',
    },
  });
  const email = watch('email');
  const lines = toLineInputs();
  const linesKey = JSON.stringify(lines);

  // Server-side pricing preview: subtotal, coupon discount, shipping and total.
  const loadQuote = useCallback(async (coupon?: string) => {
    const current = JSON.parse(linesKey);
    if (!current.length) return;
    try {
      const res = await ordersApi.quote(current, coupon, email || undefined);
      setQuote(res.data);
      setQuoteError(null);
    } catch (err) {
      setQuoteError(errorMessage(err));
      if (coupon) {
        setAppliedCoupon(undefined);
        const fallback = await ordersApi.quote(current, undefined).catch(() => null);
        if (fallback) setQuote(fallback.data);
      }
    }
  }, [linesKey, email]);

  useEffect(() => {
    loadQuote(appliedCoupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey]);

  useEffect(() => {
    if (!cartLoading && items.length === 0 && !isProcessing) navigate('/cart', { replace: true });
  }, [cartLoading, items.length, isProcessing, navigate]);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await ordersApi.validateCoupon(code, lines, email || undefined);
      setQuote(res.data);
      setAppliedCoupon(res.data.coupon?.code);
      setQuoteError(null);
      notify.success('Coupon applied', `${res.data.coupon?.code} saves you ${formatPrice(res.data.discount)}`);
    } catch (err) {
      notify.error('Coupon not applied', errorMessage(err));
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(undefined);
    setCouponInput('');
    loadQuote(undefined);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setFormError(null);
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    try {
      const res = await ordersApi.place({
        items: lines,
        customer: { name: fullName, email: data.email, phone: data.phone },
        shippingAddress: {
          fullName, phone: data.phone, line1: data.address, line2: data.address2,
          city: data.city, state: data.state, postalCode: data.zipCode, country: data.country,
        },
        paymentMethod,
        couponCode: appliedCoupon,
        notes: data.notes,
      });
      await clearCart();
      notify.success('Order placed', `Order ${res.data.orderNumber} is confirmed.`);
      navigate('/order-success', { replace: true, state: { order: res.data } });
    } catch (err) {
      const message = errorMessage(err, 'We could not place your order.');
      setFormError(message);
      notify.error('Order failed', message);
      // Stock may have changed; refresh prices and availability.
      refresh().catch(() => undefined);
      setIsProcessing(false);
    }
  };

  if (cartLoading && items.length === 0) return <div className="min-h-screen bg-brand-black"><Spinner /></div>;
  if (items.length === 0) return null;

  const inputClass =
    'w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-sm placeholder-white/20 focus:outline-none transition-colors duration-300';
  const labelClass = 'block text-[10px] font-medium text-brand-muted mb-1.5 uppercase tracking-[0.2em]';
  const err = (msg?: string) => msg && <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{msg}</p>;

  return (
    <div className="min-h-screen bg-brand-black py-16">
      <div className="luxury-container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-8 border-b border-white/6"
        >
          <div>
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-2">Secure Checkout</p>
            <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">Checkout</h1>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </button>
        </motion.div>

        {!user && (
          <p className="mb-8 text-xs text-brand-muted tracking-wide">
            Checking out as a guest. <Link to="/auth?redirect=/checkout" className="text-brand-champagne underline">Log in</Link> to track orders in your account.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12" noValidate>
          <div className="lg:col-span-2 space-y-10">
            {/* Contact Information */}
            <div className="bg-brand-surface border border-white/6 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Step 1</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Contact Information</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass} htmlFor="email">Email Address *</label>
                  <input id="email" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                    type="email" autoComplete="email" className={inputClass} placeholder="your@email.com" />
                  {err(errors.email?.message)}
                </div>
                <div>
                  <label className={labelClass} htmlFor="phone">Mobile Number *</label>
                  <input id="phone" {...register('phone', { required: 'Phone number is required', minLength: { value: 9, message: 'Enter a valid phone number' } })}
                    type="tel" autoComplete="tel" className={inputClass} placeholder="+94 77 123 4567" />
                  {err(errors.phone?.message)}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-brand-surface border border-white/6 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Step 2</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Shipping Details</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass} htmlFor="firstName">First Name *</label>
                    <input id="firstName" {...register('firstName', { required: 'First name is required' })} autoComplete="given-name" className={inputClass} placeholder="First name" />
                    {err(errors.firstName?.message)}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="lastName">Last Name *</label>
                    <input id="lastName" {...register('lastName', { required: 'Last name is required' })} autoComplete="family-name" className={inputClass} placeholder="Last name" />
                    {err(errors.lastName?.message)}
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="address">Delivery Address *</label>
                  <input id="address" {...register('address', { required: 'Address is required' })} autoComplete="address-line1" className={inputClass} placeholder="Street address" />
                  {err(errors.address?.message)}
                </div>
                <div>
                  <label className={labelClass} htmlFor="address2">Apartment, suite, etc.</label>
                  <input id="address2" {...register('address2')} autoComplete="address-line2" className={inputClass} placeholder="Optional" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass} htmlFor="city">City *</label>
                    <input id="city" {...register('city', { required: 'City is required' })} autoComplete="address-level2" className={inputClass} placeholder="City" />
                    {err(errors.city?.message)}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="state">Province</label>
                    <input id="state" {...register('state')} autoComplete="address-level1" className={inputClass} placeholder="Province" />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="zipCode">Postal Code</label>
                    <input id="zipCode" {...register('zipCode')} autoComplete="postal-code" className={inputClass} placeholder="Postal Code" />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="country">Country *</label>
                  <select id="country" {...register('country', { required: 'Country is required' })} className={`${inputClass} cursor-pointer appearance-none`}>
                    <option value="Sri Lanka" className="bg-brand-black">Sri Lanka</option>
                  </select>
                  <p className="text-[10px] text-brand-muted mt-1.5">We currently deliver within Sri Lanka.</p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="notes">Delivery Notes</label>
                  <textarea id="notes" {...register('notes', { maxLength: { value: 500, message: 'Notes are too long' } })} rows={2} className={inputClass} placeholder="Optional" />
                  {err(errors.notes?.message)}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-brand-surface border border-white/6 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Step 3</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Payment Method</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup">
                {([
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives.', Icon: Banknote },
                  { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Bank details are shown after you order. We ship once payment clears.', Icon: Landmark },
                ] as const).map(({ value, label, desc, Icon }) => (
                  <button
                    type="button"
                    key={value}
                    role="radio"
                    aria-checked={paymentMethod === value}
                    onClick={() => setPaymentMethod(value)}
                    className={`text-left p-5 border transition-colors ${paymentMethod === value ? 'border-brand-champagne bg-brand-champagne/5' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <Icon className="w-5 h-5 text-brand-champagne mb-3" />
                    <p className="text-xs text-white uppercase tracking-[0.15em]">{label}</p>
                    <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-surface border border-white/6 p-6 sm:p-8 sticky top-28 space-y-6">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.25em] text-[10px] mb-1">Summary</p>
                <h2 className="text-lg font-light text-white uppercase tracking-[0.15em]">Your Order</h2>
                <div className="h-px w-8 bg-brand-champagne mt-3" />
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {items.filter(i => i.available).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-white/6 last:border-0">
                    <SafeImage src={item.image} alt={item.name} wrapperClassName="w-12 h-14 border border-white/10 flex-shrink-0" className="w-full h-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-light text-white uppercase tracking-wide truncate">{item.name}</h4>
                      <p className="text-[10px] text-brand-muted uppercase tracking-wider">
                        {[item.size, item.color, `Qty: ${item.quantity}`].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    <span className="text-xs font-light text-brand-champagne flex-shrink-0">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-emerald-400/30 bg-emerald-400/5 px-3 py-2">
                    <span className="flex items-center gap-2 text-xs text-emerald-300 tracking-[0.15em]"><Tag className="w-3.5 h-3.5" />{appliedCoupon}</span>
                    <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="text-brand-muted hover:text-white"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      className="flex-1 min-w-0 bg-transparent border border-white/15 focus:border-brand-champagne px-3 py-2 text-xs text-white tracking-[0.15em] placeholder-white/20 focus:outline-none"
                    />
                    <button type="button" onClick={applyCoupon} disabled={couponBusy || !couponInput.trim()}
                      className="px-4 border border-brand-champagne/40 text-brand-champagne text-[10px] uppercase tracking-[0.18em] hover:bg-brand-champagne hover:text-brand-black disabled:opacity-40">
                      {couponBusy ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs tracking-wide">
                {quoteError && !quote && <p className="text-red-400 text-[11px]">{quoteError}</p>}
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span className="text-white">{quote ? formatPrice(quote.subtotal) : '…'}</span>
                </div>
                {quote && quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Discount ({quote.coupon?.code})</span>
                    <span>−{formatPrice(quote.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-muted">
                  <span>Shipping</span>
                  <span className="text-white">{!quote ? '…' : quote.shipping === 0 ? 'Complimentary' : formatPrice(quote.shipping)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-[0.2em] text-white">Total</span>
                  <span className="text-xl font-light text-brand-champagne">{quote ? formatPrice(quote.total) : '…'}</span>
                </div>
                <p className="text-[10px] text-brand-muted">All prices in LKR. Totals are confirmed by our server when you place the order.</p>
              </div>

              {formError && <p className="text-red-400 text-xs border border-red-400/30 bg-red-400/5 p-3" role="alert">{formError}</p>}

              <motion.button
                type="submit"
                disabled={isProcessing || !quote}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-brand-canvas text-brand-black py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-black mr-2"></div>
                    Placing Order…
                  </>
                ) : (
                  `Place Order${quote ? ` • ${formatPrice(quote.total)}` : ''}`
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-brand-muted uppercase tracking-[0.15em]">
                <ShieldCheck className="w-4 h-4 text-brand-champagne" />
                <span>No card details needed</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
