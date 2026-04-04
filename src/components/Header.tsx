import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Heart, Search, Menu, X, Sun, Moon, DollarSign, Tag, Copy, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { theme, currency, toggleTheme, toggleCurrency } = useTheme();
  const navigate = useNavigate();

  const promoCodes = [
    { code: 'CSTYLE50', desc: '50% OFF First Order' },
    { code: 'MEGA30', desc: '30% OFF Everything' },
    { code: 'FREESHIP', desc: 'FREE SHIPPING' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate promo codes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promoCodes.length]);

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-brand-black/95 backdrop-blur-md shadow-lg'
        : 'bg-white dark:bg-brand-black'
        }`}
    >
      {/* Top Bar - Yellow with Promo Codes */}
      <div className="bg-brand-gold text-brand-black py-2">
        <div className="luxury-container">
          <div className="flex items-center justify-between text-xs md:text-sm font-medium">
            {/* Left Side - Made in Sri Lanka */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="whitespace-nowrap">🇱🇰 Made in Sri Lanka</span>
              <span className="hidden lg:inline">|</span>
              <span className="hidden lg:inline whitespace-nowrap">Free Shipping Over {currency === 'USD' ? '$100' : 'Rs 32,500'}</span>
            </div>

            {/* Center - Promo Codes (Rotating) */}
            <div className="flex items-center space-x-2 mx-2 md:mx-4 min-w-0">
              <Tag className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPromoIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-2 min-w-0"
                >
                  <span className="font-black whitespace-nowrap truncate">
                    {promoCodes[currentPromoIndex].code}
                  </span>
                  <span className="hidden sm:inline text-xs opacity-90 truncate">
                    - {promoCodes[currentPromoIndex].desc}
                  </span>
                  <button
                    onClick={() => copyPromoCode(promoCodes[currentPromoIndex].code)}
                    className="flex-shrink-0 ml-1 p-1 hover:bg-brand-black/10 rounded transition-colors"
                    aria-label="Copy promo code"
                  >
                    {copiedCode === promoCodes[currentPromoIndex].code ? (
                      <Check className="w-3 h-3 md:w-4 md:h-4" />
                    ) : (
                      <Copy className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side - Currency Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleCurrency}
                className="flex items-center space-x-1 hover:opacity-80 transition-opacity whitespace-nowrap"
                aria-label="Toggle Currency"
              >
                <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-bold">{currency}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="luxury-container">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-12 h-12 bg-gradient-gold flex items-center justify-center">
                <span className="text-brand-black font-bold text-xl font-poppins">C</span>
              </div>
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-50 blur-xl transition-opacity"></div>
            </motion.div>
            <div>
              <span className="text-2xl lg:text-3xl font-bold font-poppins text-brand-black dark:text-white tracking-tight">
                Cstyle
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest">Sri Lanka</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            {[
              { path: '/', label: 'Home' },
              { path: '/shop', label: 'Shop' },
              { path: '/about', label: 'Our Story' },
              { path: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-gray-700 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold font-medium uppercase text-sm tracking-wider transition-colors group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden xl:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search luxury fashion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500 hover:text-brand-gold transition-colors" />
              </button>
            </div>
          </form>

          {/* Desktop Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden xl:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="text-gray-700 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-gray-700 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-brand-gold text-brand-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-brand-gold text-brand-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 dark:text-gray-300 p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="xl:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-black"
          >
            <div className="luxury-container py-6">
              <nav className="flex flex-col space-y-4 mb-6">
                {[
                  { path: '/', label: 'Home' },
                  { path: '/shop', label: 'Shop' },
                  { path: '/about', label: 'Our Story' },
                  { path: '/contact', label: 'Contact' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-brand-gold font-medium uppercase tracking-wider py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center justify-around pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center space-y-1 text-gray-700 dark:text-gray-300"
                >
                  {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  <span className="text-xs">Theme</span>
                </button>

                {user ? (
                  <div className="flex flex-col items-center space-y-1">
                    <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{user.name}</span>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="flex flex-col items-center space-y-1 text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-6 h-6" />
                    <span className="text-xs">Login</span>
                  </Link>
                )}

                <Link
                  to="/wishlist"
                  className="relative flex flex-col items-center space-y-1 text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-6 h-6" />
                  <span className="text-xs">Wishlist</span>
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-gold text-brand-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative flex flex-col items-center space-y-1 text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-xs">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-gold text-brand-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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