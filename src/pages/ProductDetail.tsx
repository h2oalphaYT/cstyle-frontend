import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft,
  Truck, RefreshCw, Shield, ZoomIn, X, ChevronLeft, ChevronRight,
  Check, Eye
} from 'lucide-react';
import { errorMessage, productsApi, type Product, type Review } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { useApi } from '../hooks/useApi';
import SafeImage from '../components/SafeImage';
import ProductCard from '../components/ProductCard';
import { ErrorState, ProductGridSkeleton, Spinner } from '../components/StateViews';
import { resolveImageUrl } from '../utils/image';
import { pushRecentlyViewed } from '../utils/recentlyViewed';

// ── Zoom config ──────────────────────────────────────────────────────
const LENS_W = 140;
const LENS_H = 140;
const ZOOM   = 3;

const ProductDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: product, loading, error, reload } = useApi(() => productsApi.get(id), [id]);

  if (loading && !product) return <div className="min-h-screen bg-brand-black"><Spinner label="Loading product" /></div>;
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <ErrorState message={error || 'Product not found'} onRetry={error && !/not found/i.test(error) ? reload : undefined} />
          <Link to="/shop" className="inline-block bg-brand-gold text-black px-6 py-3 font-bold uppercase text-xs tracking-widest">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }
  return <ProductView key={product.id} product={product} />;
};

const ProductView: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useTheme();
  const notify = useNotify();

  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState(product.colors.length === 1 ? product.colors[0].name : '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Zoom state ────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [previewBg, setPreviewBg] = useState({ x: 0, y: 0 });
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    pushRecentlyViewed(product.id);
    productsApi.recordView(product.id).catch(() => undefined);
  }, [product.id]);

  const hasVariants = product.variants.length > 0;
  const variantFor = useCallback((size: string, color: string) =>
    product.variants.find(v => v.size === size && v.color.toLowerCase() === color.toLowerCase()), [product.variants]);

  const selectedVariant = selectedSize || !product.sizes.length ? variantFor(selectedSize, selectedColor) : undefined;
  const available = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;
  const selectionComplete = (!product.sizes.length || !!selectedSize) && (!product.colors.length || !!selectedColor);

  // A size is selectable if any colour (or the chosen colour) has stock.
  const sizeInStock = (size: string) => !hasVariants || product.variants.some(v => v.size === size && v.stock > 0
    && (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()));
  const colorInStock = (color: string) => !hasVariants || product.variants.some(v => v.color.toLowerCase() === color.toLowerCase() && v.stock > 0
    && (!selectedSize || v.size === selectedSize));

  useEffect(() => {
    if (quantity > available && available > 0) setQuantity(available);
  }, [available, quantity]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const lx = Math.max(0, Math.min(mx - LENS_W / 2, rect.width  - LENS_W));
    const ly = Math.max(0, Math.min(my - LENS_H / 2, rect.height - LENS_H));
    setLensPos({ x: lx, y: ly });
    setPreviewBg({ x: (lx / (rect.width - LENS_W)) * 100, y: (ly / (rect.height - LENS_H)) * 100 });
    setPanelStyle({ top: rect.top, left: rect.right + 12, height: rect.height });
  }, []);

  // Large zoom panel only makes sense when there is room to the right (desktop).
  const canZoom = typeof window !== 'undefined' && window.innerWidth >= 1024;

  const handleAddToCart = async () => {
    if (!selectionComplete) {
      notify.warning('Choose your options', 'Please select a colour and size first.');
      return;
    }
    setAdding(true);
    try {
      await addToCart({ product, size: selectedSize, color: selectedColor, quantity });
      setAddedToCart(true);
      notify.success('Added to cart', `${quantity} × ${product.name}`);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      notify.error('Could not add to cart', errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const added = await toggleWishlist(product);
      notify.success(added ? 'Saved to wishlist' : 'Removed from wishlist', product.name);
    } catch (err) {
      notify.error('Wishlist not updated', errorMessage(err));
    }
  };

  const inWishlist = isInWishlist(product.id);
  const lightboxPrev = () => setSelectedImage(i => (i - 1 + images.length) % images.length);
  const lightboxNext = () => setSelectedImage(i => (i + 1) % images.length);

  const stockMessage = !selectionComplete
    ? null
    : available <= 0
      ? <span className="text-red-400">Out of stock in this option</span>
      : available <= 5
        ? <span className="text-amber-400">Only {available} left</span>
        : <span className="text-emerald-400">In stock</span>;

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 overflow-hidden">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 hover:text-brand-gold transition-colors font-medium flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-gold transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-gold transition-colors whitespace-nowrap">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* LEFT — Image Gallery + Zoom */}
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col gap-2.5 w-20 flex-shrink-0">
              {images.map((img, idx) => (
                <motion.button
                  key={img + idx}
                  onClick={() => setSelectedImage(idx)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label={`Show image ${idx + 1}`}
                  className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 rounded-sm
                    ${selectedImage === idx
                      ? 'border-brand-gold shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-gold/60'
                    }`}
                >
                  <SafeImage src={img} alt={`${product.name} view ${idx + 1}`} wrapperClassName="w-full h-full" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="relative" style={{ isolation: 'isolate' }}>
                <div
                  ref={containerRef}
                  className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 select-none rounded-sm"
                  style={{ aspectRatio: '3/4', cursor: zoom ? 'crosshair' : 'zoom-in' }}
                  onMouseEnter={() => canZoom && setZoom(true)}
                  onMouseLeave={() => setZoom(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => !zoom && setLightbox(true)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <SafeImage
                        src={images[selectedImage]}
                        alt={product.name}
                        eager
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {zoom && (
                      <motion.div
                        className="absolute pointer-events-none z-20"
                        style={{
                          left: lensPos.x, top: lensPos.y, width: LENS_W, height: LENS_H,
                          border: '2px solid rgba(212,175,55,0.9)',
                          background: 'rgba(212,175,55,0.12)',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
                        }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {!zoom && (
                      <motion.div
                        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        {canZoom ? 'Hover to zoom · Click to enlarge' : 'Tap to enlarge'}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none">
                    {selectedImage + 1} / {images.length}
                  </div>
                </div>

                <AnimatePresence>
                  {zoom && (
                    <motion.div
                      className="fixed z-[100] rounded-sm overflow-hidden shadow-2xl border border-brand-gold/40 pointer-events-none bg-gray-100"
                      style={{
                        top: panelStyle.top,
                        left: panelStyle.left,
                        width: Math.max(0, Math.min(420, window.innerWidth - panelStyle.left - 16)),
                        height: panelStyle.height,
                        backgroundImage: `url(${resolveImageUrl(images[selectedImage])})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: `${ZOOM * 100}%`,
                        backgroundPosition: `${previewBg.x}% ${previewBg.y}%`,
                      }}
                      initial={{ opacity: 0, scale: 0.96, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.96, x: -10 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-champagne" />
                      <div className="absolute bottom-2 right-2 text-[10px] text-white/60 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {ZOOM}× zoom
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile thumbnails */}
              <div className="flex gap-2 sm:hidden overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 rounded-sm transition-all
                      ${selectedImage === idx ? 'border-brand-gold' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <SafeImage src={img} alt="" wrapperClassName="w-full h-full" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {images.length > 1 && (
                <div className="flex items-center justify-between px-1">
                  <button onClick={lightboxPrev} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-gold transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button onClick={() => setLightbox(true)} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-gold transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Full screen view
                  </button>
                  <button onClick={lightboxNext} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-gold transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Product Info Panel */}
          <div className="space-y-6 lg:pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em] font-semibold">
                {[product.category?.name, product.gender !== 'men' ? product.gender : null].filter(Boolean).join(' • ')}
              </p>
              {product.newArrival && (
                <span className="bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                  New Arrival
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black font-poppins text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.ratingAverage) ? 'text-brand-gold fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
              <a href="#reviews" className="text-sm text-gray-600 dark:text-gray-400 font-medium hover:text-brand-gold">
                {product.ratingCount > 0 ? product.ratingAverage.toFixed(1) : 'No ratings yet'}{' '}
                <span className="text-gray-400">({product.ratingCount} review{product.ratingCount === 1 ? '' : 's'})</span>
              </a>
              <span className="text-xs text-gray-400 ml-auto">SKU {selectedVariant?.sku || product.sku}</span>
            </div>

            <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 flex-wrap">
              <span className="text-4xl font-black text-brand-gold">{formatPrice(product.finalPrice)}</span>
              {product.onSale && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-[15px] font-medium">{product.shortDescription}</p>
            )}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px] whitespace-pre-line">{product.description}</p>

            {product.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Key Features</h3>
                <ul className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Colour</h3>
                  {selectedColor && <span className="text-xs text-brand-gold font-semibold capitalize">{selectedColor}</span>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map(color => {
                    const inStock = colorInStock(color.name);
                    const selected = selectedColor === color.name;
                    return (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color.name)}
                        title={inStock ? color.name : `${color.name} (sold out${selectedSize ? ` in ${selectedSize}` : ''})`}
                        aria-label={color.name}
                        aria-pressed={selected}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all duration-200 shadow-sm ${inStock ? '' : 'opacity-35'}
                          ${selected
                            ? 'border-brand-gold ring-2 ring-brand-gold ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                            : 'border-gray-300 dark:border-gray-600 hover:border-brand-gold/60'
                          }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected && <Check className="absolute inset-0 m-auto w-4 h-4 mix-blend-difference text-white" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Size</h3>
                  {selectedSize && <span className="text-xs text-brand-gold font-semibold">{selectedSize} selected</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => {
                    const inStock = sizeInStock(size);
                    return (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={`min-w-[52px] px-4 py-2.5 text-sm font-bold border-2 transition-all duration-200 rounded-sm ${inStock ? '' : 'line-through opacity-40'}
                          ${selectedSize === size
                            ? 'border-brand-gold bg-brand-gold text-brand-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-gold hover:text-brand-gold bg-transparent'
                          }`}
                      >
                        {size}
                      </motion.button>
                    );
                  })}
                </div>
                {!selectionComplete && (
                  <p className="text-xs text-amber-500 font-medium">
                    {!selectedColor && !selectedSize ? '⚠ Please select a colour and size'
                      : !selectedColor ? '⚠ Please select a colour'
                      : '⚠ Please select a size'}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Qty</h3>
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-gold transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(q + 1, Math.max(1, available), 99))} aria-label="Increase quantity"
                  disabled={selectionComplete && quantity >= available}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-gold transition-colors disabled:opacity-30">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total: <span className="font-bold text-brand-gold">{formatPrice(product.finalPrice * quantity)}</span>
              </span>
              <span className="text-xs font-semibold w-full">{stockMessage}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={adding || (selectionComplete && available <= 0) || product.stock <= 0}
                whileTap={{ scale: 0.98 }}
                className={`relative flex-1 overflow-hidden py-4 font-medium uppercase tracking-[0.2em] text-xs transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-canvas text-brand-black hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {addedToCart ? (
                    <><Check className="w-4 h-4" /> Added to Selection</>
                  ) : product.stock <= 0 ? (
                    'Sold Out'
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /> {adding ? 'Adding…' : 'Add to Cart'}</>
                  )}
                </span>
              </motion.button>
              <motion.button
                onClick={handleWishlistToggle}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`w-14 h-14 flex items-center justify-center border-2 transition-all duration-200
                  ${inWishlist ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-400'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              {[
                { Icon: Truck,     label: 'Free Shipping', sub: `Over ${formatPrice(30000)}` },
                { Icon: RefreshCw, label: '30-Day Returns', sub: 'Easy returns' },
                { Icon: Shield,    label: 'Secure',        sub: 'Cash on delivery' },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 py-3">
                  <Icon className="w-5 h-5 text-brand-gold mb-0.5" />
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {(product.specifications.length > 0 || product.material) && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-sm border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-3">Details & Care</h4>
                <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
                  {(product.specifications.length ? product.specifications : [{ key: 'Material', value: product.material }]).map(s => (
                    <React.Fragment key={s.key}>
                      <dt className="text-gray-400">{s.key}</dt>
                      <dd className="text-gray-700 dark:text-gray-300">{s.value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        <Reviews product={product} />
        <RelatedProducts productId={product.id} />
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/96 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            role="dialog" aria-modal="true" aria-label="Image viewer"
          >
            <button onClick={() => setLightbox(false)} aria-label="Close"
              className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {selectedImage + 1} / {images.length}
            </div>
            <button onClick={e => { e.stopPropagation(); lightboxPrev(); }} aria-label="Previous image"
              className="absolute left-4 z-10 w-12 h-12 bg-white/10 hover:bg-brand-gold/80 rounded-full flex items-center justify-center text-white transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <motion.div className="max-w-3xl w-full max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}>
              <SafeImage key={selectedImage} src={images[selectedImage]} alt={product.name} eager
                wrapperClassName="w-full aspect-[3/4] max-h-[85vh] bg-transparent"
                className="w-full h-full object-contain rounded-sm" />
            </motion.div>
            <button onClick={e => { e.stopPropagation(); lightboxNext(); }} aria-label="Next image"
              className="absolute right-4 z-10 w-12 h-12 bg-white/10 hover:bg-brand-gold/80 rounded-full flex items-center justify-center text-white transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" onClick={e => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button key={img + idx} onClick={() => setSelectedImage(idx)} aria-label={`Show image ${idx + 1}`}
                  className={`w-12 h-12 overflow-hidden rounded-sm border-2 transition-all ${selectedImage === idx ? 'border-brand-gold' : 'border-white/20 hover:border-white/50'}`}>
                  <SafeImage src={img} alt="" wrapperClassName="w-full h-full" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Customer Reviews ─────────────────────────────────────────────
const Reviews: React.FC<{ product: Product }> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const notify = useNotify();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Review[]>([]);
  const { data, pagination, loading, reload } = useApi(() => productsApi.reviews(product.id, page), [product.id, page]);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) setItems(prev => (page === 1 ? data : [...prev, ...data.filter(r => !prev.some(p => p.id === r.id))]));
  }, [data, page]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating) {
      notify.warning('Choose a rating', 'Tap the stars to rate this product.');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.addReview(product.id, form);
      notify.success('Review posted', 'Thanks for sharing your thoughts!');
      setForm({ rating: 0, title: '', comment: '' });
      setPage(1);
      reload();
    } catch (err) {
      notify.error('Review not posted', errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <div id="reviews" className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-14 scroll-mt-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 dark:text-white">Customer Reviews</h2>
        <p className="text-sm text-gray-500">
          {product.ratingCount > 0 ? `${product.ratingAverage.toFixed(1)} out of 5 · ${product.ratingCount} review${product.ratingCount === 1 ? '' : 's'}` : 'Be the first to review this product'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading && !items.length ? <Spinner label="Loading reviews" /> : items.length === 0 ? (
            <p className="text-sm text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center">No reviews yet.</p>
          ) : items.map(review => (
            <div key={review.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-brand-gold fill-current' : 'text-gray-300'}`} />
                ))}
                {review.title && <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">{review.title}</span>}
              </div>
              {review.comment && <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">"{review.comment}"</p>}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{review.name}</span>
                  {review.verifiedPurchase && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">✓ Verified purchase</span>}
                </div>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {hasMore && (
            <button onClick={() => setPage(p => p + 1)} disabled={loading}
              className="w-full py-3 border border-gray-200 dark:border-gray-700 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-brand-gold">
              {loading ? 'Loading…' : 'Show more reviews'}
            </button>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-sm h-fit">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">Write a Review</h3>
          {isAuthenticated ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map(n => (
                  <button type="button" key={n} onClick={() => setForm(f => ({ ...f, rating: n }))} aria-label={`${n} star${n > 1 ? 's' : ''}`} role="radio" aria-checked={form.rating === n}>
                    <Star className={`w-6 h-6 ${n <= form.rating ? 'text-brand-gold fill-current' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <input value={form.title} maxLength={120} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (optional)"
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold" />
              <textarea value={form.comment} maxLength={2000} rows={4} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="What did you think?"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-gold" />
              <button disabled={submitting} className="w-full bg-brand-gold text-brand-black py-3 text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50">
                {submitting ? 'Posting…' : 'Post Review'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              <Link to={`/auth?redirect=/product/${product.slug}`} className="text-brand-gold underline">Log in</Link> to write a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const RelatedProducts: React.FC<{ productId: string }> = ({ productId }) => {
  const { data, loading } = useApi(() => productsApi.related(productId, 4), [productId]);
  const items = useMemo(() => data || [], [data]);
  if (!loading && !items.length) return null;
  return (
    <div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-14">
      <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 dark:text-white mb-8">You May Also Like</h2>
      {loading ? <ProductGridSkeleton count={4} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
