import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Heart, Search, Menu, X, Sun, Moon, DollarSign, Tag, Copy, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { couponsApi } from '../api';
import SearchBox from './SearchBox';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoCodes, setPromoCodes] = useState<{ code: string; desc: string }[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { theme, currency, toggleTheme, toggleCurrency, formatPrice } = useTheme();
  const navigate = useNavigate();

  // Active coupon codes come from the admin-managed coupon list.
  useEffect(() => {
    couponsApi.publicList()
      .then(res => setPromoCodes(res.data.map(c => ({ code: c.code, desc: c.description }))))
      .catch(() => setPromoCodes([]));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-black/96 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-brand-black'
      }`}
    >
      {/* Announcement Bar — subtle dark strip */}
      <div className="bg-brand-surface text-brand-subtle py-2">
        <div className="luxury-container">
          <div className="flex items-center justify-between text-xs font-medium tracking-[0.12em] uppercase">
            {/* Left Side */}
            <div className="flex items-center space-x-4">
              <span className="whitespace-nowrap opacity-80">🇱🇰 Made in Sri Lanka</span>
              <span className="hidden lg:inline text-brand-subtle/40">|</span>
              <span className="hidden lg:inline whitespace-nowrap opacity-70">
                Free Shipping Over {formatPrice(30000)}
              </span>
            </div>

            {/* Center - Rotating Promo Codes */}
            <div className="flex items-center space-x-2 mx-4 min-w-0">
              {promo && (
                <>
                  <Tag className="w-3 h-3 flex-shrink-0 text-brand-champagne" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={promo.code}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center space-x-2 min-w-0"
                    >
                      <span className="font-semibold text-brand-subtle whitespace-nowrap truncate tracking-[0.15em]">
                        {promo.code}
                      </span>
                      <span className="hidden sm:inline text-xs opacity-60 truncate normal-case tracking-normal">
                        — {promo.desc}
                      </span>
                      <button
                        onClick={() => copyPromoCode(promo.code)}
                        className="flex-shrink-0 ml-1 p-1 hover:text-brand-champagne rounded transition-colors"
                        aria-label="Copy promo code"
                      >
                        {copiedCode === promo.code ? (
                          <Check className="w-3 h-3 text-brand-champagne" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Right Side - Currency Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleCurrency}
                className="flex items-center space-x-1 hover:text-brand-champagne transition-colors whitespace-nowrap"
                aria-label="Toggle Currency"
              >
                <DollarSign className="w-3 h-3" />
                <span className="font-semibold tracking-[0.12em]">{currency}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="luxury-container">
        <div className="flex items-center justify-between h-18 lg:h-20 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              {/* Minimal square logo mark */}
              <div className="w-9 h-9 border border-brand-champagne/60 flex items-center justify-center group-hover:border-brand-champagne transition-colors duration-300">
                <span className="text-brand-champagne font-light text-base tracking-widest font-poppins">C</span>
              </div>
            </motion.div>
            <div>
              <span className="text-xl lg:text-2xl font-light font-poppins text-white tracking-[0.15em] uppercase">
                Cstyle
              </span>
              <p className="text-[9px] text-brand-muted uppercase tracking-[0.3em] mt-0.5">Sri Lanka</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10 xl:space-x-14">
            {[
              { path: '/', label: 'Home' },
              { path: '/shop', label: 'Shop' },
              { path: '/about', label: 'Our Story' },
              { path: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-brand-muted hover:text-white text-xs uppercase tracking-[0.2em] transition-colors duration-300 group py-1"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-champagne group-hover:w-full transition-all duration-400 ease-out" />
              </Link>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Expandable Search */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    key="search-form"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 240 }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mr-2"
                  >
                    <SearchBox
                      ref={searchInputRef}
                      onDone={() => setSearchOpen(false)}
                      inputClassName="w-full bg-transparent border-b border-brand-muted/40 focus:border-brand-champagne text-white placeholder-brand-muted/60 text-xs tracking-[0.12em] py-1 px-0 outline-none transition-colors duration-300"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={toggleSearch}
                className="text-brand-muted hover:text-white transition-colors duration-300"
                aria-label="Toggle search"
              >
                {searchOpen
                  ? <X className="w-4 h-4" />
                  : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="text-brand-muted hover:text-white transition-colors duration-300"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-brand-muted hover:text-white transition-colors duration-300">
                  <User className="w-4 h-4" />
                  <span className="text-xs tracking-[0.12em] hidden xl:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-3 w-44 bg-brand-surface border border-white/8 shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/account" className="block px-5 py-3 text-xs text-brand-muted hover:text-white hover:bg-white/5 tracking-[0.1em] uppercase transition-colors">
                    My Account
                  </Link>
                  <Link to="/account/orders" className="block px-5 py-3 text-xs text-brand-muted hover:text-white hover:bg-white/5 tracking-[0.1em] uppercase transition-colors">
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-5 py-3 text-xs text-brand-champagne hover:text-white hover:bg-white/5 tracking-[0.1em] uppercase transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-5 py-3 text-xs text-brand-muted hover:text-white hover:bg-white/5 tracking-[0.1em] uppercase transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="text-brand-muted hover:text-white transition-colors duration-300">
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-brand-muted hover:text-white transition-colors duration-300">
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 bg-brand-champagne text-brand-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-brand-muted hover:text-white transition-colors duration-300">
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 bg-brand-champagne text-brand-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-brand-muted hover:text-white p-2 transition-colors duration-300"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="xl:hidden pb-3">
          <SearchBox
            showButton
            onDone={() => setIsMenuOpen(false)}
            inputClassName="w-full bg-transparent border-b border-white/10 focus:border-brand-champagne text-white placeholder-brand-muted/60 text-xs tracking-[0.12em] py-2 pr-6 px-0 outline-none transition-colors duration-300"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden border-t border-white/6 bg-brand-black"
          >
            <div className="luxury-container py-8">
              <nav className="flex flex-col space-y-1 mb-8">
                {[
                  { path: '/', label: 'Home' },
                  { path: '/shop', label: 'Shop' },
                  { path: '/about', label: 'Our Story' },
                  { path: '/contact', label: 'Contact' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-brand-muted hover:text-white font-light uppercase tracking-[0.2em] text-sm py-3 border-b border-white/5 last:border-0 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center justify-around pt-6 border-t border-white/6">
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center space-y-1.5 text-brand-muted hover:text-white transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-[10px] tracking-[0.15em] uppercase">Theme</span>
                </button>

                {user ? (
                  <Link
                    to={isAdmin ? '/admin' : '/account'}
                    className="flex flex-col items-center space-y-1.5 text-brand-muted hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] tracking-[0.15em] uppercase">{isAdmin ? 'Admin' : 'Account'}</span>
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="flex flex-col items-center space-y-1.5 text-brand-muted hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] tracking-[0.15em] uppercase">Login</span>
                  </Link>
                )}

                <Link
                  to="/wishlist"
                  className="relative flex flex-col items-center space-y-1.5 text-brand-muted hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-[10px] tracking-[0.15em] uppercase">Wishlist</span>
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 right-0 bg-brand-champagne text-brand-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative flex flex-col items-center space-y-1.5 text-brand-muted hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-[10px] tracking-[0.15em] uppercase">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 right-0 bg-brand-champagne text-brand-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;