import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Heart, Search, Menu, X, Sun, Moon, Tag, Copy, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { couponsApi } from '../api';
import { FREE_SHIPPING_THRESHOLD } from '../config/store';
import { duration, ease } from '../design/tokens';
import SearchBox from './SearchBox';

const NAV = [
  { path: '/', label: 'Home' },
  { path: '/shop', label: 'Shop' },
  { path: '/about', label: 'Our Story' },
  { path: '/contact', label: 'Contact' },
];

/** Height of the promo strip; the header slides up by this much to hide it. */
const PROMO_H = 36;

const Badge = ({ count }: { count: number }) => (
  count > 0 ? (
    <span className="absolute top-1.5 right-1 bg-cs-accent text-brand-black text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-semibold" aria-hidden>
      {count > 99 ? '99+' : count}
    </span>
  ) : null
);

const iconBtn = 'relative tap-44 flex items-center justify-center text-cs-muted hover:text-cs-text transition-colors duration-fast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promoHidden, setPromoHidden] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoCodes, setPromoCodes] = useState<{ code: string; desc: string }[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { totalItems } = useCart();
  const { user, logout, isAdmin, isBackOffice } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { theme, currency, toggleTheme, toggleCurrency, formatPrice } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Active coupon codes come from the admin-managed coupon list.
  useEffect(() => {
    couponsApi.publicList()
      .then(res => setPromoCodes(res.data.map(c => ({ code: c.code, desc: c.description }))))
      .catch(() => setPromoCodes([]));
  }, []);

  // Solid header with a border once scrolled; the promo strip hides on scroll down and
  // returns on scroll up, so the sticky area is just the 64px bar while browsing.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y < 80) setPromoHidden(false);
      else if (y - lastY > 6) setPromoHidden(true);
      else if (lastY - y > 6) setPromoHidden(false);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close overlays on navigation.
  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Lock page scroll and support Escape while an overlay is open.
  const overlayOpen = isMenuOpen || searchOpen;
  useEffect(() => {
    if (!overlayOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsMenuOpen(false); setSearchOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [overlayOpen]);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchOpen]);

  // Auto-rotate promo codes
  useEffect(() => {
    if (promoCodes.length < 2) return undefined;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promoCodes.length]);

  const copyPromoCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const promo = promoCodes[currentPromoIndex % Math.max(1, promoCodes.length)];

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const openSearch = () => { setIsMenuOpen(false); setSearchOpen(true); };

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-transform duration-base ease-cs"
        style={{ transform: promoHidden ? `translateY(-${PROMO_H}px)` : undefined }}
      >
        {/* Announcement bar */}
        <div className="bg-cs-surface text-cs-muted border-b border-cs-border" style={{ height: PROMO_H }}>
          <div className="luxury-container h-full">
            <div className="flex items-center justify-between h-full text-[11px] font-medium tracking-[0.12em] uppercase gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <span className="hidden sm:inline whitespace-nowrap">Made in Sri Lanka</span>
                <span className="hidden lg:inline text-cs-muted/50" aria-hidden>|</span>
                <span className="hidden lg:inline whitespace-nowrap">
                  Free Shipping Over {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </span>
              </div>

              {/* Rotating promo codes */}
              <div className="flex items-center gap-2 min-w-0" aria-live="polite">
                {promo && (
                  <>
                    <Tag className="w-3 h-3 flex-shrink-0 text-cs-accent" aria-hidden />
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={promo.code}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: duration.fast }}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <span className="font-semibold text-cs-text whitespace-nowrap tracking-[0.15em]">{promo.code}</span>
                        <span className="hidden md:inline opacity-90 truncate normal-case tracking-normal">— {promo.desc}</span>
                        <button
                          onClick={() => copyPromoCode(promo.code)}
                          className="flex-shrink-0 w-8 h-8 -my-2 flex items-center justify-center hover:text-cs-accent transition-colors"
                          aria-label={copiedCode === promo.code ? 'Copied' : `Copy promo code ${promo.code}`}
                        >
                          {copiedCode === promo.code ? <Check className="w-3.5 h-3.5 text-cs-accent" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Currency toggle */}
              <button
                onClick={toggleCurrency}
                className="flex items-center gap-1 h-8 px-1 hover:text-cs-accent transition-colors whitespace-nowrap flex-shrink-0"
                aria-label={`${currency === 'LKR' ? 'Rs' : '$'} ${currency}, switch currency`}
              >
                <span className="text-cs-accent normal-case">{currency === 'LKR' ? 'Rs' : '$'}</span>
                <span className="font-semibold tracking-[0.12em]">{currency}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main bar: solid background (no blur), so nothing shows through over light images. */}
        <div
          className={`transition-[background-color,box-shadow] duration-base ${
            scrolled
              ? 'bg-[#121212]/[0.97] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08),0_6px_20px_-12px_rgba(0,0,0,0.8)]'
              : 'bg-[#121212]'
          }`}
        >
          <div className="luxury-container">
            <div className="flex items-center justify-between h-header gap-2">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group flex-shrink-0 min-w-0" aria-label="Cstyle Sri Lanka, home">
                <div className="w-9 h-9 border border-cs-accent/60 flex items-center justify-center group-hover:border-cs-accent transition-colors duration-base flex-shrink-0">
                  <span className="text-cs-accent font-light text-base tracking-widest font-poppins">C</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-lg lg:text-2xl font-light font-poppins text-cs-text tracking-[0.15em] uppercase leading-none">Cstyle</span>
                  <span className="block text-[9px] text-cs-muted uppercase tracking-[0.3em] mt-1">Sri Lanka</span>
                </div>
              </Link>

              {/* Desktop navigation */}
              <nav className="hidden lg:flex items-center gap-10 xl:gap-14" aria-label="Main">
                {NAV.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `relative text-xs uppercase tracking-[0.2em] transition-colors duration-base group py-1 ${isActive ? 'text-cs-text' : 'text-cs-muted hover:text-cs-text'}`}
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <span className={`absolute -bottom-0.5 left-0 h-px bg-cs-accent transition-all duration-base ease-cs ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Icons */}
              <div className="flex items-center -mr-2 lg:mr-0 lg:gap-1">
                <button onClick={openSearch} className={iconBtn} aria-label="Search" aria-haspopup="dialog" aria-expanded={searchOpen}>
                  <Search className="w-[18px] h-[18px]" />
                </button>

                <button onClick={toggleTheme} className={`${iconBtn} hidden lg:flex`} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {user ? (
                  <div className="relative group hidden lg:block">
                    <Link to="/account" className={`${iconBtn} gap-2 px-2`} aria-label="My account">
                      <User className="w-4 h-4" />
                      <span className="text-xs tracking-[0.12em] hidden xl:inline">{user.name}</span>
                    </Link>
                    <div className="absolute right-0 top-full w-48 bg-cs-surface border border-cs-border shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-fast">
                      <Link to="/account" className="block px-5 py-3 text-xs text-cs-muted hover:text-cs-text hover:bg-white/5 tracking-[0.1em] uppercase">My Account</Link>
                      <Link to="/account/orders" className="block px-5 py-3 text-xs text-cs-muted hover:text-cs-text hover:bg-white/5 tracking-[0.1em] uppercase">My Orders</Link>
                      {isBackOffice && (
                        <Link to={isAdmin ? '/admin' : '/admin/hr'} className="block px-5 py-3 text-xs text-cs-accent hover:text-cs-text hover:bg-white/5 tracking-[0.1em] uppercase">
                          {isAdmin ? 'Admin Panel' : 'Payroll & HR'}
                        </Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-5 py-3 text-xs text-cs-muted hover:text-cs-text hover:bg-white/5 tracking-[0.1em] uppercase">Logout</button>
                    </div>
                  </div>
                ) : (
                  <Link to="/auth" className={`${iconBtn} hidden lg:flex`} aria-label="Log in">
                    <User className="w-4 h-4" />
                  </Link>
                )}

                <Link to="/wishlist" className={`${iconBtn} hidden lg:flex`} aria-label={`Wishlist, ${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'}`}>
                  <Heart className="w-4 h-4" />
                  <Badge count={wishlistItems.length} />
                </Link>

                <Link to="/cart" className={iconBtn} aria-label={`Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`}>
                  <ShoppingCart className="w-[18px] h-[18px] lg:w-4 lg:h-4" />
                  <Badge count={totalItems} />
                </Link>

                <button
                  onClick={() => { setSearchOpen(false); setIsMenuOpen(o => !o); }}
                  className={`${iconBtn} lg:hidden`}
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlays are portalled to <body> so the header's transform can't trap them. */}
      {createPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="menu"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-0 z-[70] bg-cs-bg flex flex-col lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast, ease }}
            >
              <div className="luxury-container w-full flex items-center justify-between h-16 border-b border-cs-border flex-shrink-0">
                <span className="text-cs-accent uppercase tracking-[0.3em] text-xs">Menu</span>
                <div className="flex items-center -mr-2">
                  <button onClick={openSearch} className={iconBtn} aria-label="Search"><Search className="w-[18px] h-[18px]" /></button>
                  <button onClick={() => setIsMenuOpen(false)} className={iconBtn} aria-label="Close menu" aria-expanded autoFocus>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="luxury-container w-full flex-1 overflow-y-auto py-8">
                <nav className="flex flex-col" aria-label="Mobile">
                  {NAV.map((item, i) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: duration.base, ease, delay: 0.06 + i * 0.06 }}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `block font-poppins font-light uppercase tracking-[0.2em] text-2xl py-4 border-b border-cs-border ${isActive ? 'text-cs-accent' : 'text-cs-text'}`}
                      >
                        {item.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  className="grid grid-cols-2 gap-px bg-cs-border mt-10 border border-cs-border"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.base, ease, delay: 0.06 + NAV.length * 0.06 }}
                >
                  {[
                    user
                      ? { to: '/account', Icon: User, label: 'My Account' }
                      : { to: '/auth', Icon: User, label: 'Log In' },
                    { to: '/wishlist', Icon: Heart, label: `Wishlist${wishlistItems.length ? ` (${wishlistItems.length})` : ''}` },
                    { to: '/cart', Icon: ShoppingCart, label: `Cart${totalItems ? ` (${totalItems})` : ''}` },
                    ...(user ? [{ to: '/account/orders', Icon: Tag, label: 'My Orders' }] : [{ to: '/track-order', Icon: Tag, label: 'Track Order' }]),
                  ].map(({ to, Icon, label }) => (
                    <Link key={to} to={to} className="bg-cs-bg flex items-center gap-3 px-4 py-4 min-h-[56px] text-cs-muted hover:text-cs-text text-xs uppercase tracking-[0.15em]">
                      <Icon className="w-4 h-4 text-cs-accent flex-shrink-0" /> {label}
                    </Link>
                  ))}
                </motion.div>

                <div className="flex items-center justify-between mt-8 text-xs uppercase tracking-[0.15em] text-cs-muted">
                  <button onClick={toggleTheme} className="flex items-center gap-2 min-h-[44px]">
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === 'dark' ? 'Light theme' : 'Dark theme'}
                  </button>
                  <button onClick={toggleCurrency} className="flex items-center gap-1 min-h-[44px]">
                    <span className="text-cs-accent normal-case">{currency === 'LKR' ? 'Rs' : '$'}</span> {currency}
                  </button>
                  {user && (
                    <button onClick={handleLogout} className="min-h-[44px]">Logout</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {searchOpen && (
            <motion.div
              key="search"
              role="dialog"
              aria-modal="true"
              aria-label="Search products"
              className="fixed inset-0 z-[80] bg-cs-bg flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast, ease }}
            >
              <div className="luxury-container w-full flex items-center justify-end h-16 lg:h-20 flex-shrink-0">
                <button onClick={() => setSearchOpen(false)} className={`${iconBtn} -mr-2`} aria-label="Close search">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <motion.div
                className="luxury-container w-full max-w-3xl pt-4 lg:pt-16"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: duration.base, ease, delay: 0.05 }}
              >
                <p className="cs-eyebrow mb-4">Search</p>
                <SearchBox
                  ref={searchInputRef}
                  showButton
                  variant="overlay"
                  onDone={() => setSearchOpen(false)}
                  inputClassName="w-full bg-transparent border-b border-cs-border-strong focus:border-cs-accent text-cs-text placeholder-cs-muted font-poppins font-light text-xl md:text-3xl tracking-[0.06em] py-3 pr-10 outline-none transition-colors"
                />
                <p className="text-cs-muted text-xs mt-4 tracking-wide">Try “linen”, “polo” or a product code.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default Header;
