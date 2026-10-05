import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Package, User as UserIcon } from 'lucide-react';
import { authApi, errorMessage, ordersApi, tokenStore, type Order, type OrderStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotify } from '../context/NotificationContext';
import { useApi } from '../hooks/useApi';
import SafeImage from '../components/SafeImage';
import { EmptyState, ErrorState, Spinner } from '../components/StateViews';

export const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-amber-300 border-amber-300/40',
  confirmed: 'text-sky-300 border-sky-300/40',
  processing: 'text-indigo-300 border-indigo-300/40',
  shipped: 'text-brand-champagne border-brand-champagne/40',
  delivered: 'text-emerald-300 border-emerald-300/40',
  cancelled: 'text-red-300 border-red-300/40',
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-block border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${STATUS_COLORS[status]}`}>{status}</span>
);

const inputClass = 'w-full px-0 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-sm placeholder-white/20 focus:outline-none transition-colors';
const labelClass = 'block text-[10px] font-medium text-brand-muted mb-1 uppercase tracking-[0.2em]';

/** Redirects guests to the login page and back afterwards. */
const RequireLogin = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="min-h-screen bg-brand-black"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
};

const Shell = ({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-brand-black py-12 md:py-16">
    <div className="luxury-container max-w-5xl space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-white/6 pb-8">
        <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-2">{eyebrow}</p>
        <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">{title}</h1>
      </motion.div>
      {children}
    </div>
  </div>
);

// ── /account ─────────────────────────────────────────────────────
const AccountHome = () => {
  const { user, setUser, logout } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [address, setAddress] = useState({
    line1: defaultAddr?.line1 || '', line2: defaultAddr?.line2 || '', city: defaultAddr?.city || '',
    state: defaultAddr?.state || '', postalCode: defaultAddr?.postalCode || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const { data: orders, loading } = useApi(() => ordersApi.mine(1), []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const addresses = address.line1 && address.city
        ? [{ label: 'Home', fullName: profile.name, phone: profile.phone, country: 'Sri Lanka', isDefault: true, ...address }]
        : [];
      const res = await authApi.updateMe({ ...profile, addresses });
      setUser(res.data);
      notify.success('Profile saved');
    } catch (err) {
      notify.error('Profile not saved', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.changePassword(passwords.currentPassword, passwords.newPassword);
      tokenStore.set(res.data.token);
      setPasswords({ currentPassword: '', newPassword: '' });
      notify.success('Password changed', 'Other devices have been signed out.');
    } catch (err) {
      notify.error('Password not changed', errorMessage(err));
    }
  };

  return (
    <Shell eyebrow="My Account" title={`Hello, ${user?.name.split(' ')[0]}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-brand-surface border border-white/6 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm text-white uppercase tracking-[0.2em] flex items-center gap-2"><Package className="w-4 h-4 text-brand-champagne" /> Recent Orders</h2>
              <Link to="/account/orders" className="text-[10px] text-brand-muted hover:text-brand-champagne uppercase tracking-[0.2em]">View all</Link>
            </div>
            {loading ? <Spinner /> : !orders?.length ? (
              <p className="text-sm text-brand-muted">You haven't placed any orders yet. <Link to="/shop" className="text-brand-champagne underline">Start shopping</Link></p>
            ) : (
              <div className="divide-y divide-white/6">
                {orders.slice(0, 3).map(o => <OrderRow key={o.id} order={o} />)}
              </div>
            )}
          </section>

          <form onSubmit={saveProfile} className="bg-brand-surface border border-white/6 p-6 sm:p-8 space-y-6">
            <h2 className="text-sm text-white uppercase tracking-[0.2em] flex items-center gap-2"><UserIcon className="w-4 h-4 text-brand-champagne" /> Profile & Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelClass} htmlFor="p-name">Name</label><input id="p-name" className={inputClass} value={profile.name} required onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className={labelClass} htmlFor="p-phone">Phone</label><input id="p-phone" className={inputClass} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="md:col-span-2"><label className={labelClass} htmlFor="p-line1">Default delivery address</label><input id="p-line1" className={inputClass} placeholder="Street address" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} /></div>
              <div className="md:col-span-2"><input aria-label="Address line 2" className={inputClass} placeholder="Apartment, suite (optional)" value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} /></div>
              <div><input aria-label="City" className={inputClass} placeholder="City" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <input aria-label="Province" className={inputClass} placeholder="Province" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} />
                <input aria-label="Postal code" className={inputClass} placeholder="Postal code" value={address.postalCode} onChange={e => setAddress(a => ({ ...a, postalCode: e.target.value }))} />
              </div>
            </div>
            <p className="text-[11px] text-brand-muted">Email: {user?.email}</p>
            <button disabled={saving} className="bg-brand-canvas text-brand-black px-8 py-3 text-xs uppercase tracking-[0.2em] disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          </form>
        </div>

        <div className="space-y-8">
          <form onSubmit={changePassword} className="bg-brand-surface border border-white/6 p-6 sm:p-8 space-y-5">
            <h2 className="text-sm text-white uppercase tracking-[0.2em]">Change Password</h2>
            <div><label className={labelClass} htmlFor="cp">Current password</label><input id="cp" type="password" autoComplete="current-password" required className={inputClass} value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} /></div>
            <div><label className={labelClass} htmlFor="np">New password</label><input id="np" type="password" autoComplete="new-password" minLength={8} required className={inputClass} value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} /></div>
            <button className="w-full border border-brand-champagne/40 text-brand-champagne py-3 text-xs uppercase tracking-[0.2em] hover:bg-brand-champagne hover:text-brand-black transition-colors">Update Password</button>
          </form>
          <div className="space-y-3">
            <Link to="/wishlist" className="block text-center border border-white/10 py-3 text-xs text-brand-muted hover:text-white uppercase tracking-[0.2em]">My Wishlist</Link>
            <button onClick={async () => { await logout(); navigate('/'); }}
              className="w-full flex items-center justify-center gap-2 border border-white/10 py-3 text-xs text-brand-muted hover:text-red-300 uppercase tracking-[0.2em]">
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
};

const OrderRow = ({ order }: { order: Order }) => {
  const { formatPrice } = useTheme();
  return (
    <Link to={`/account/orders/${order.id}`} className="flex items-center gap-4 py-4 hover:bg-white/[0.02] -mx-2 px-2">
      <SafeImage src={order.items[0]?.image} alt="" wrapperClassName="w-12 h-14 flex-shrink-0 border border-white/10" className="w-full h-full object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white tracking-[0.15em]">#{order.orderNumber}</p>
        <p className="text-[11px] text-brand-muted">{new Date(order.createdAt).toLocaleDateString()} · {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
      </div>
      <div className="text-right space-y-1">
        <p className="text-xs text-brand-champagne">{formatPrice(order.total)}</p>
        <StatusBadge status={order.orderStatus} />
      </div>
    </Link>
  );
};

// ── /account/orders ──────────────────────────────────────────────
const OrdersList = () => {
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useApi(() => ordersApi.mine(page), [page]);
  return (
    <Shell eyebrow="My Account" title="Order History">
      <Link to="/account" className="inline-flex items-center gap-2 text-xs text-brand-muted hover:text-brand-champagne uppercase tracking-[0.2em]"><ArrowLeft className="w-3.5 h-3.5" /> Account</Link>
      {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Spinner /> : !data?.length ? (
        <EmptyState title="No orders yet" message="Your orders will appear here." action={<Link to="/shop" className="text-brand-champagne underline text-sm">Start shopping</Link>} />
      ) : (
        <div className="bg-brand-surface border border-white/6 px-4 sm:px-8 divide-y divide-white/6">
          {data.map(o => <OrderRow key={o.id} order={o} />)}
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-white/15 text-xs text-brand-muted disabled:opacity-30">Previous</button>
          <span className="text-xs text-brand-muted self-center">Page {page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-white/15 text-xs text-brand-muted disabled:opacity-30">Next</button>
        </div>
      )}
    </Shell>
  );
};

// ── Order detail (shared by /account/orders/:id and /track-order) ─
export const OrderDetailView = ({ order, onCancel }: { order: Order; onCancel?: () => void }) => {
  const { formatPrice } = useTheme();
  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const a = order.shippingAddress;
  return (
    <div className="space-y-8">
      <div className="bg-brand-surface border border-white/6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-white tracking-[0.2em]">ORDER #{order.orderNumber}</p>
            <p className="text-[11px] text-brand-muted mt-1">Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>
        {order.orderStatus !== 'cancelled' && (
          <ol className="grid grid-cols-5 gap-2" aria-label="Order progress">
            {STATUS_STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <div className={`h-1 mb-2 ${i <= currentStep ? 'bg-brand-champagne' : 'bg-white/10'}`} />
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-[0.12em] ${i <= currentStep ? 'text-white' : 'text-brand-muted'}`}>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-brand-surface border border-white/6 p-6 sm:p-8 space-y-4">
          {order.items.map(item => (
            <div key={item._id} className="flex items-center gap-4">
              <SafeImage src={item.image} alt={item.name} wrapperClassName="w-14 h-16 flex-shrink-0 border border-white/10" className="w-full h-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white uppercase tracking-[0.12em] truncate">{item.name}</p>
                <p className="text-[11px] text-brand-muted">{[item.size, item.color].filter(Boolean).join(' / ')} · Qty {item.quantity} · {formatPrice(item.unitPrice)}</p>
              </div>
              <span className="text-xs text-brand-champagne">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-brand-muted"><span>Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-300"><span>Discount {order.coupon?.code && `(${order.coupon.code})`}</span><span>−{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between text-brand-muted"><span>Shipping</span><span className="text-white">{order.shipping ? formatPrice(order.shipping) : 'Complimentary'}</span></div>
            <div className="flex justify-between text-white uppercase tracking-[0.15em] pt-2"><span>Total</span><span className="text-brand-champagne">{formatPrice(order.total)}</span></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-brand-surface border border-white/6 p-6 text-xs text-brand-muted space-y-1 leading-relaxed">
            <p className="text-[10px] text-brand-champagne uppercase tracking-[0.2em] mb-2">Delivery</p>
            <p className="text-white">{a.fullName}</p>
            <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
            <p>{[a.city, a.state, a.postalCode].filter(Boolean).join(', ')}</p>
            <p>{a.country}</p>
            {a.phone && <p>{a.phone}</p>}
          </div>
          <div className="bg-brand-surface border border-white/6 p-6 text-xs text-brand-muted space-y-1">
            <p className="text-[10px] text-brand-champagne uppercase tracking-[0.2em] mb-2">Payment</p>
            <p className="text-white">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
            <p className="capitalize">Status: {order.paymentStatus}</p>
          </div>
          {onCancel && ['pending', 'confirmed'].includes(order.orderStatus) && (
            <button onClick={onCancel} className="w-full border border-red-400/40 text-red-300 py-3 text-xs uppercase tracking-[0.2em] hover:bg-red-400/10">Cancel Order</button>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id = '' } = useParams();
  const notify = useNotify();
  const { data: order, loading, error, reload, setData } = useApi(() => ordersApi.get(id), [id]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order? Items will be returned to stock.')) return;
    try {
      const res = await ordersApi.cancel(id);
      setData(res.data);
      notify.success('Order cancelled', `Order ${res.data.orderNumber} has been cancelled.`);
    } catch (err) {
      notify.error('Could not cancel', errorMessage(err));
    }
  };

  return (
    <Shell eyebrow="My Orders" title={order ? `Order #${order.orderNumber}` : 'Order'}>
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-xs text-brand-muted hover:text-brand-champagne uppercase tracking-[0.2em]"><ArrowLeft className="w-3.5 h-3.5" /> All orders</Link>
      {error ? <ErrorState message={error} onRetry={reload} /> : loading || !order ? <Spinner /> : <OrderDetailView order={order} onCancel={cancel} />}
    </Shell>
  );
};

// ── /track-order (guests) ───────────────────────────────────────
export const TrackOrder = () => {
  const location = useLocation();
  const initial = (location.state as { orderNumber?: string; email?: string } | null) || {};
  const [form, setForm] = useState({ orderNumber: initial.orderNumber || '', email: initial.email || '' });
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setOrder((await ordersApi.track(form.orderNumber.trim(), form.email.trim())).data);
    } catch (err) {
      setOrder(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial.orderNumber && initial.email) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell eyebrow="Orders" title="Track Your Order">
      <form onSubmit={lookup} className="bg-brand-surface border border-white/6 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div><label className={labelClass} htmlFor="t-num">Order number</label><input id="t-num" required className={inputClass} placeholder="CS100001" value={form.orderNumber} onChange={e => setForm(f => ({ ...f, orderNumber: e.target.value.toUpperCase() }))} /></div>
        <div><label className={labelClass} htmlFor="t-email">Email used at checkout</label><input id="t-email" required type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <button disabled={loading} className="bg-brand-canvas text-brand-black py-3 text-xs uppercase tracking-[0.2em] disabled:opacity-50">{loading ? 'Searching…' : 'Track Order'}</button>
      </form>
      {error && <ErrorState message={error} />}
      {order && <OrderDetailView order={order} />}
    </Shell>
  );
};

export const AccountPage = () => <RequireLogin><AccountHome /></RequireLogin>;
export const AccountOrdersPage = () => <RequireLogin><OrdersList /></RequireLogin>;
export const AccountOrderDetailPage = () => <RequireLogin><OrderDetailPage /></RequireLogin>;
