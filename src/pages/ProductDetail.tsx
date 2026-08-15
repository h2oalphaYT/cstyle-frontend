import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft,
  Truck, RefreshCw, Shield, ZoomIn, X, ChevronLeft, ChevronRight,
  Check, Eye
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

// ── Zoom config ──────────────────────────────────────────────────────
// LENS = the highlight box dragged on the source image
const LENS_W = 140;  // px — width of the highlight box
const LENS_H = 140;  // px — height of the highlight box
const ZOOM   = 3;    // magnification factor for the big preview panel

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useTheme();

  const product = products.find(p => p.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Zoom state ────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(false);
  // Lens top-left position (clamped inside image)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  // backgroundPosition % for the large preview panel
  const [previewBg, setPreviewBg] = useState({ x: 0, y: 0 });
  // Fixed position of zoom panel (right of image, aligned to image top)
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Lightbox state
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <button onClick={() => navigate('/shop')} className="bg-brand-gold text-black px-6 py-3 font-bold uppercase">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image];

  // ── Mouse move: calculate lens position + large panel bg-position ──
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Keep lens fully inside the image
    const lx = Math.max(0, Math.min(mx - LENS_W / 2, rect.width  - LENS_W));
    const ly = Math.max(0, Math.min(my - LENS_H / 2, rect.height - LENS_H));
    setLensPos({ x: lx, y: ly });

    // bg-position for the large panel (0–100%)
    const px = (lx / (rect.width  - LENS_W)) * 100;
    const py = (ly / (rect.height - LENS_H)) * 100;
    setPreviewBg({ x: px, y: py });

    // Update fixed panel position based on image rect
    setPanelStyle({
      top:    rect.top + window.scrollY,
      left:   rect.right + 12,           // 12px gap right of image
      height: rect.height,
    });
  }, []);

  // ── Add to cart ───────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id, name: product.name,
        price: product.price, image: product.image,
        size: selectedSize, color: selectedColor
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category });
    }
  };

  const inWishlist = isInWishlist(product.id);

  const getColorHex = (color: string) => {
    const map: Record<string, string> = {
      black: '#000', white: '#fff', navy: '#1e3a8a', gray: '#6b7280',
      blue: '#3b82f6', red: '#ef4444', beige: '#F5E6CC', green: '#22c55e',
      pink: '#f9a8d4', purple: '#a855f7', brown: '#92400e', yellow: '#eab308',
    };
    return map[color.toLowerCase()] ?? '#8b5cf6';
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const lightboxPrev = () => setSelectedImage(i => (i - 1 + images.length) % images.length);
  const lightboxNext = () => setSelectedImage(i => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 hover:text-brand-gold transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-gold transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Standard 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ════════════════════════════════════════════════════
              LEFT — Image Gallery + Large-Panel Zoom
          ════════════════════════════════════════════════════ */}
          <div className="flex gap-4">

            {/* Vertical thumbnail strip */}
            <div className="hidden sm:flex flex-col gap-2.5 w-20 flex-shrink-0">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 rounded-sm
                    ${selectedImage === idx
                      ? 'border-brand-gold shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-gold/60'
                    }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  {selectedImage === idx && <div className="absolute inset-0 bg-brand-gold/10" />}
                </motion.button>
              ))}
            </div>

            {/* ── Main image + Zoom panel wrapper ── */}
            <div className="flex-1 space-y-3">

              {/*
                OUTER wrapper: position:relative so the zoom PANEL
                can be absolutely placed OVER / RIGHT of the image.
                We use overflow-visible so the panel can bleed out.
              */}
              <div className="relative" style={{ isolation: 'isolate' }}>

                {/* ── Source image container ── */}
                <div
                  ref={containerRef}
                  className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 select-none rounded-sm"
                  style={{
                    aspectRatio: '3/4',
                    cursor: zoom ? 'crosshair' : 'zoom-in',
                  }}
                  onMouseEnter={() => setZoom(true)}
                  onMouseLeave={() => setZoom(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => !zoom && setLightbox(true)}
                >
                  {/* Fade between images */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage}
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      draggable={false}
                    />
                  </AnimatePresence>

                  {/* ── Highlight lens box on source image ── */}
                  <AnimatePresence>
                    {zoom && (
                      <motion.div
                        className="absolute pointer-events-none z-20"
                        style={{
                          left: lensPos.x,
                          top:  lensPos.y,
                          width:  LENS_W,
                          height: LENS_H,
                          border: '2px solid rgba(212,175,55,0.9)',
                          background: 'rgba(212,175,55,0.12)',
                          backdropFilter: 'brightness(1.1)',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hint badge (shown only when not hovering) */}
                  <AnimatePresence>
                    {!zoom && (
                      <motion.div
                        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        Hover to zoom · Click to enlarge
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Counter */}
                  <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none">
                    {selectedImage + 1} / {images.length}
                  </div>
                </div>

                {/* ════════════════════════════════════════
                    LARGE ZOOM PREVIEW PANEL — fixed positioned
                    Always sits flush to the RIGHT of the image
                    at the exact same top+height. Works on any
                    viewport without being clipped by overflow.
                ════════════════════════════════════════ */}
                <AnimatePresence>
                  {zoom && (
                    <motion.div
                      className="fixed z-[100] rounded-sm overflow-hidden shadow-2xl border border-brand-gold/40 pointer-events-none"
                      style={{
                        top:    panelStyle.top,
                        left:   panelStyle.left,
                        width:  Math.min(420, window.innerWidth - panelStyle.left - 16),
                        height: panelStyle.height,
                        backgroundImage:    `url(${images[selectedImage]})`,
                        backgroundRepeat:   'no-repeat',
                        backgroundSize:     `${ZOOM * 100}%`,
                        backgroundPosition: `${previewBg.x}% ${previewBg.y}%`,
                      }}
                      initial={{ opacity: 0, scale: 0.96, x: -10 }}
                      animate={{ opacity: 1, scale: 1,    x: 0   }}
                      exit={{    opacity: 0, scale: 0.96, x: -10  }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {/* Champagne top bar */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-champagne" />
                      {/* Zoom badge */}
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
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 rounded-sm transition-all
                      ${selectedImage === idx ? 'border-brand-gold' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Prev / Next / Fullscreen controls */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-gold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setLightbox(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-gold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Full screen view
                </button>
                <button
                  onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-gold transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              RIGHT — Product Info Panel
          ════════════════════════════════════════════════════ */}
          <div className="space-y-6 lg:pt-2">

            {/* Category + badge */}
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em] font-semibold">
                {product.category} • {product.subcategory}
              </p>
              {product.isNew && (
                <span className="bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                  New Arrival
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-black font-poppins text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-brand-gold fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {product.rating} <span className="text-gray-400">({product.reviews} reviews)</span>
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-4xl font-black text-brand-gold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">{product.description}</p>

            {/* Features */}
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

            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Color</h3>
                {selectedColor && <span className="text-xs text-brand-gold font-semibold capitalize">{selectedColor}</span>}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(color => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all duration-200 shadow-sm
                      ${selectedColor === color
                        ? 'border-brand-gold ring-2 ring-brand-gold ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-brand-gold/60'
                      }`}
                    style={{ backgroundColor: getColorHex(color) }}
                  >
                    {selectedColor === color && (
                      <Check
                        className="absolute inset-0 m-auto w-4 h-4"
                        style={{ color: ['white', 'beige', 'yellow'].includes(color.toLowerCase()) ? '#000' : '#fff' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Size</h3>
                {selectedSize && <span className="text-xs text-brand-gold font-semibold">{selectedSize} selected</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[52px] px-4 py-2.5 text-sm font-bold border-2 transition-all duration-200 rounded-sm
                      ${selectedSize === size
                        ? 'border-brand-gold bg-brand-gold text-brand-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-gold hover:text-brand-gold bg-transparent'
                      }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
              {(!selectedSize || !selectedColor) && (
                <p className="text-xs text-amber-500 font-medium">
                  {!selectedColor && !selectedSize ? '⚠ Please select a color and size'
                    : !selectedColor ? '⚠ Please select a color'
                    : '⚠ Please select a size'}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Qty</h3>
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-gold transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-gold transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total: <span className="font-bold text-brand-gold">{formatPrice(product.price * quantity)}</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.98 }}
                className={`relative flex-1 overflow-hidden py-4 font-medium uppercase tracking-[0.2em] text-xs transition-all duration-300 rounded-sm ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-canvas text-brand-black hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Selection
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </span>
              </motion.button>
              <motion.button
                onClick={handleWishlistToggle}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className={`w-14 h-14 flex items-center justify-center border-2 transition-all duration-200
                  ${inWishlist ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-400'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              {[
                { Icon: Truck,     label: 'Free Shipping', sub: 'Over Rs 32,500' },
                { Icon: RefreshCw, label: '30-Day Returns', sub: 'Easy returns'   },
                { Icon: Shield,    label: 'Secure',        sub: '100% protected'  },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 py-3">
                  <Icon className="w-5 h-5 text-brand-gold mb-0.5" />
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Material */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-sm border border-gray-100 dark:border-gray-800">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-1.5">Material & Care</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.material}</p>
              <p className="text-xs text-gray-400 mt-1">Machine wash cold · Tumble dry low</p>
            </div>
          </div>
        </div>

        {/* ── Customer Reviews ── */}
        <div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-14">
          <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 dark:text-white mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', rating: 5, date: '2 weeks ago', comment: 'Love this product! Perfect fit and great quality.', verified: true },
              { name: 'Mike R.', rating: 4, date: '1 month ago', comment: 'Good quality and fast shipping. Slightly different color than expected but still happy.', verified: true },
              { name: 'Emily K.', rating: 5, date: '1 month ago', comment: 'Exceeded my expectations! Beautiful design and comfortable to wear.', verified: false },
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-sm hover:border-brand-gold/40 transition-colors"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-brand-gold fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{review.name}</span>
                    {review.verified && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                  </div>
                  <span>{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          LIGHTBOX — Full screen viewer
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/96 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <button onClick={() => setLightbox(false)}
              className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {selectedImage + 1} / {images.length}
            </div>
            <button onClick={e => { e.stopPropagation(); lightboxPrev(); }}
              className="absolute left-4 z-10 w-12 h-12 bg-white/10 hover:bg-brand-gold/80 rounded-full flex items-center justify-center text-white transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <motion.div className="max-w-3xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}>
              <AnimatePresence mode="wait">
                <motion.img key={selectedImage} src={images[selectedImage]} alt={product.name}
                  className="max-h-[85vh] max-w-full object-contain rounded-sm shadow-2xl"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} />
              </AnimatePresence>
            </motion.div>
            <button onClick={e => { e.stopPropagation(); lightboxNext(); }}
              className="absolute right-4 z-10 w-12 h-12 bg-white/10 hover:bg-brand-gold/80 rounded-full flex items-center justify-center text-white transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" onClick={e => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className={`w-12 h-12 overflow-hidden rounded-sm border-2 transition-all ${selectedImage === idx ? 'border-brand-gold' : 'border-white/20 hover:border-white/50'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;