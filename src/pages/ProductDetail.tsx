import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft,
  Truck, RefreshCw, Shield, ZoomIn, X, ChevronLeft, ChevronRight,
  Check, Eye, Box, PenLine,
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
import { imageIndexForColor } from '../utils/colorImage';
import { FREE_SHIPPING_THRESHOLD } from '../config/store';
import { duration, ease } from '../design/tokens';
import { Reveal } from '../motion';
import { supports3D } from '../components/product/viewerSupport';

// The 3D viewer (three.js) is its own chunk, fetched only when a shopper opens it.
const GarmentViewer = lazy(() => import('../components/product/GarmentViewer'));

// ── Zoom config ──────────────────────────────────────────────────────
const LENS_W = 140;
const LENS_H = 140;
const ZOOM   = 3;

const labelCls = 'text-[11px] font-medium uppercase tracking-[0.2em] text-cs-text';

const ProductDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: product, loading, error, reload } = useApi(() => productsApi.get(id), [id]);

  if (loading && !product) return <div className="min-h-screen bg-cs-bg"><Spinner label="Loading product" /></div>;
  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cs-bg px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <ErrorState message={error || 'Product not found'} onRetry={error && !/not found/i.test(error) ? reload : undefined} />
          <Link to="/shop" className="inline-block border border-cs-accent/50 text-cs-accent px-6 py-3 uppercase text-xs tracking-[0.2em] hover:bg-cs-accent hover:text-brand-black transition-colors">
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
  // The "please select" hint only appears after the shopper tries to add to cart.
  const [attempted, setAttempted] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [can3D, setCan3D] = useState(false);

  // ── Zoom state ────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [previewBg, setPreviewBg] = useState({ x: 0, y: 0 });
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [lightbox, setLightbox] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    pushRecentlyViewed(product.id);
    productsApi.recordView(product.id).catch(() => undefined);
    setCan3D(supports3D());
  }, [product.id]);

  // Mobile sticky cart bar: visible once the main Add to Cart button has scrolled out of view
  // (above the viewport). A scroll check, not IntersectionObserver, so fast jumps can't skip it.
  useEffect(() => {
    let ticking = false;
    const check = () => {
      ticking = false;
      const el = addButtonRef.current;
      if (el) setShowStickyBar(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reserve space for the bar so fixed buttons (back-to-top) sit above it.
  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 1023px)').matches;
    root.style.setProperty('--cs-bottom-bar', showStickyBar && mobile ? '72px' : '0px');
    return () => { root.style.setProperty('--cs-bottom-bar', '0px'); };
  }, [showStickyBar]);

  const hasVariants = product.variants.length > 0;
  const variantFor = useCallback((size: string, color: string) =>
    product.variants.find(v => v.size === size && v.color.toLowerCase() === color.toLowerCase()), [product.variants]);

  const selectedVariant = selectedSize || !product.sizes.length ? variantFor(selectedSize, selectedColor) : undefined;
  const available = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;
  const selectionComplete = (!product.sizes.length || !!selectedSize) && (!product.colors.length || !!selectedColor);
  const needsColor = product.colors.length > 0 && !selectedColor;
  const needsSize = product.sizes.length > 0 && !selectedSize;

  // A size is selectable if any colour (or the chosen colour) has stock.
  const sizeInStock = (size: string) => !hasVariants || product.variants.some(v => v.size === size && v.stock > 0
    && (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()));
  const colorInStock = (color: string) => !hasVariants || product.variants.some(v => v.color.toLowerCase() === color.toLowerCase() && v.stock > 0
    && (!selectedSize || v.size === selectedSize));

  useEffect(() => {
    if (quantity > available && available > 0) setQuantity(available);
  }, [available, quantity]);

  const chooseColor = (name: string) => {
    setSelectedColor(name);
    // Crossfade the gallery to the picture of that colour.
    setSelectedImage(imageIndexForColor(product, name));
  };

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
  const canZoom = typeof window !== 'undefined' && window.innerWidth >= 1024 && window.matchMedia('(hover: hover)').matches;

  /** Scrolls to the colour/size pickers and pulses the ones still missing. */
  const promptForOptions = () => {
    setAttempted(true);
    setHighlight(h => h + 1);
    optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAddToCart = async () => {
    if (!selectionComplete) {
      promptForOptions();
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
  const soldOut = product.stock <= 0;
  const optionSoldOut = selectionComplete && available <= 0;

  const stockMessage = !selectionComplete
    ? null
    : available <= 0
      ? <span className="text-red-400">Out of stock in this option</span>
      : available <= 5
        ? <span className="text-amber-300">Only {available} left</span>
        : <span className="text-emerald-400">In stock</span>;

  const missingHint = attempted && !selectionComplete
    ? (needsColor && needsSize ? 'Please select a colour and size' : needsColor ? 'Please select a colour' : 'Please select a size')
    : null;

  const addLabel = addedToCart ? 'Added to Selection' : soldOut ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart';

  return (
    <div className="bg-cs-bg pb-24 lg:pb-0">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-cs-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-2 text-xs text-cs-muted overflow-hidden" aria-label="Breadcrumb">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 h-11 hover:text-cs-accent transition-colors flex-shrink-0 uppercase tracking-[0.12em]">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span aria-hidden>/</span>
          <Link to="/shop" className="hover:text-cs-accent transition-colors">Shop</Link>
          {product.category && (
            <>
              <span aria-hidden>/</span>
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-cs-accent transition-colors whitespace-nowrap">{product.category.name}</Link>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="text-cs-text truncate" aria-current="page">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-start">

          {/* LEFT — Gallery (sticky on desktop so the column is never empty) */}
          <div className="flex gap-4 lg:sticky lg:top-[calc(var(--cs-header-h)+24px)]">
            <div className="hidden sm:flex flex-col gap-2.5 w-20 flex-shrink-0">
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => { setShow3D(false); setSelectedImage(idx); }}
                  aria-label={`Show image ${idx + 1}`}
                  aria-pressed={selectedImage === idx && !show3D}
                  className={`relative aspect-[3/4] overflow-hidden border transition-colors duration-fast bg-cs-tile
                    ${selectedImage === idx && !show3D ? 'border-cs-accent' : 'border-cs-border hover:border-cs-accent/60'}`}
                >
                  <SafeImage src={img} alt="" width={80} height={107} wrapperClassName="w-full h-full bg-cs-tile" className="w-full h-full object-cover" />
                </button>
              ))}
              {can3D && (
                <button
                  onClick={() => setShow3D(true)}
                  aria-pressed={show3D}
                  className={`aspect-[3/4] flex flex-col items-center justify-center gap-1 border text-[10px] uppercase tracking-[0.15em] transition-colors ${show3D ? 'border-cs-accent text-cs-accent' : 'border-cs-border text-cs-muted hover:text-cs-text'}`}
                >
                  <Box className="w-5 h-5" /> 3D
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="relative" style={{ isolation: 'isolate' }}>
                {show3D ? (
                  <div className="relative bg-cs-surface border border-cs-border" style={{ aspectRatio: '3/4' }}>
                    <Suspense fallback={<Spinner label="Loading 3D view" />}>
                      <GarmentViewer
                        category={product.category?.slug || product.subCategory || ''}
                        color={product.colors.find(c => c.name === selectedColor)?.hex || product.colors[0]?.hex || '#d8d2c4'}
                      />
                    </Suspense>
                    <button onClick={() => setShow3D(false)} className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center bg-black/60 text-white" aria-label="Close 3D view">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                <div
                  ref={containerRef}
                  className="relative overflow-hidden bg-cs-tile select-none"
                  style={{ aspectRatio: '3/4', cursor: zoom ? 'crosshair' : 'zoom-in' }}
                  onMouseEnter={() => canZoom && setZoom(true)}
                  onMouseLeave={() => setZoom(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => !zoom && setLightbox(true)}
                >
                  {/* Crossfade (300ms) between images, e.g. when a colour is picked */}
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={selectedImage}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <SafeImage
                        src={images[selectedImage]}
                        alt={product.name}
                        eager
                        width={900}
                        height={1200}
                        wrapperClassName="w-full h-full bg-cs-tile"
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
                          border: '1px solid rgba(197,168,128,0.9)',
                          background: 'rgba(197,168,128,0.10)',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.2)',
                        }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  {!zoom && (
                    <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/70 text-white text-[11px] px-3 py-1.5 rounded-full pointer-events-none">
                      <ZoomIn className="w-3.5 h-3.5" />
                      {canZoom ? 'Hover to zoom · Click to enlarge' : 'Tap to enlarge'}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 z-10 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-full pointer-events-none">
                    {selectedImage + 1} / {images.length}
                  </div>
                </div>
                )}

                <AnimatePresence>
                  {zoom && !show3D && (
                    <motion.div
                      className="fixed z-[100] overflow-hidden shadow-2xl border border-cs-accent/40 pointer-events-none bg-cs-tile"
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cs-accent" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile thumbnails */}
              <div className="flex gap-2 sm:hidden overflow-x-auto no-scrollbar pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => { setShow3D(false); setSelectedImage(idx); }}
                    aria-label={`Show image ${idx + 1}`}
                    aria-pressed={selectedImage === idx && !show3D}
                    className={`flex-shrink-0 w-14 h-[74px] overflow-hidden border transition-colors bg-cs-tile
                      ${selectedImage === idx && !show3D ? 'border-cs-accent' : 'border-cs-border'}`}
                  >
                    <SafeImage src={img} alt="" width={56} height={74} wrapperClassName="w-full h-full bg-cs-tile" className="w-full h-full object-cover" />
                  </button>
                ))}
                {can3D && (
                  <button
                    onClick={() => setShow3D(true)}
                    aria-pressed={show3D}
                    className={`flex-shrink-0 w-14 h-[74px] flex flex-col items-center justify-center gap-1 border text-[10px] uppercase tracking-[0.12em] ${show3D ? 'border-cs-accent text-cs-accent' : 'border-cs-border text-cs-muted'}`}
                  >
                    <Box className="w-4 h-4" /> 3D
                  </button>
                )}
              </div>

              {images.length > 1 && !show3D && (
                <div className="flex items-center justify-between">
                  <button onClick={lightboxPrev} className="flex items-center gap-1 h-11 px-1 text-xs uppercase tracking-[0.12em] text-cs-muted hover:text-cs-accent transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button onClick={() => setLightbox(true)} className="flex items-center gap-1.5 h-11 px-1 text-xs uppercase tracking-[0.12em] text-cs-muted hover:text-cs-accent transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Full screen
                  </button>
                  <button onClick={lightboxNext} className="flex items-center gap-1 h-11 px-1 text-xs uppercase tracking-[0.12em] text-cs-muted hover:text-cs-accent transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="space-y-6 lg:pt-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-[11px] text-cs-accent uppercase tracking-[0.2em]">
                {[product.category?.name, product.gender !== 'men' ? product.gender : null].filter(Boolean).join(' · ')}
              </p>
              {product.newArrival && (
                <span className="border border-cs-accent/60 text-cs-accent text-[10px] uppercase tracking-[0.2em] px-2 py-0.5">New Arrival</span>
              )}
            </div>

            <h1 className="text-2xl lg:text-4xl text-cs-text leading-tight !tracking-[0.1em]">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 flex-wrap">
              {product.ratingCount > 0 && (
                <a href="#reviews" className="flex items-center gap-2 text-sm text-cs-muted hover:text-cs-accent min-h-[44px]">
                  <span className="flex" aria-hidden>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(product.ratingAverage) ? 'text-cs-accent fill-current' : 'text-white/20'}`} />
                    ))}
                  </span>
                  {product.ratingAverage.toFixed(1)} ({product.ratingCount} review{product.ratingCount === 1 ? '' : 's'})
                </a>
              )}
              <span className="text-xs text-cs-muted ml-auto">SKU {selectedVariant?.sku || product.sku}</span>
            </div>

            <div className="flex items-baseline gap-3 pb-5 border-b border-cs-border flex-wrap">
              <span className="cs-price text-3xl font-light">{formatPrice(product.finalPrice)}</span>
              {product.onSale && (
                <>
                  <span className="text-lg text-cs-muted line-through">{formatPrice(product.price)}</span>
                  <span className="bg-brand-black border border-cs-accent/60 text-white text-xs font-semibold px-2.5 py-1 tracking-[0.1em]">{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-cs-text leading-relaxed text-[15px]">{product.shortDescription}</p>
            )}
            <p className="text-cs-muted leading-relaxed text-[15px] whitespace-pre-line">{product.description}</p>

            {product.features.length > 0 && (
              <div className="space-y-3">
                <h2 className={labelCls}>Key Features</h2>
                <ul className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-cs-muted">
                      <span className="w-1 h-1 bg-cs-accent flex-shrink-0" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div ref={optionsRef} className="space-y-6 scroll-mt-28">
              {product.colors.length > 0 && (
                <div key={`c${needsColor ? highlight : 0}`} className={`space-y-2 ${attempted && needsColor && highlight ? 'cs-attention' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={labelCls} id="colour-label">Colour</h2>
                    {selectedColor && <span className="text-xs text-cs-accent capitalize">{selectedColor}</span>}
                  </div>
                  <div className="flex flex-wrap -mx-1" role="radiogroup" aria-labelledby="colour-label">
                    {product.colors.map(color => {
                      const inStock = colorInStock(color.name);
                      const selected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          onClick={() => chooseColor(color.name)}
                          title={inStock ? color.name : `${color.name} (sold out${selectedSize ? ` in ${selectedSize}` : ''})`}
                          aria-label={inStock ? color.name : `${color.name}, sold out`}
                          role="radio"
                          aria-checked={selected}
                          className="w-11 h-11 flex items-center justify-center"
                        >
                          <span
                            className={`relative w-8 h-8 rounded-full border transition-shadow duration-fast ${inStock ? '' : 'opacity-35'}
                              ${selected ? 'border-cs-accent ring-2 ring-cs-accent ring-offset-2 ring-offset-cs-bg' : 'border-white/25 hover:border-cs-accent/70'}`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {selected && <Check className="absolute inset-0 m-auto w-4 h-4 mix-blend-difference text-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div key={`s${needsSize ? highlight : 0}`} className={`space-y-2 ${attempted && needsSize && highlight ? 'cs-attention' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h2 className={labelCls} id="size-label">Size</h2>
                    {selectedSize && <span className="text-xs text-cs-accent">{selectedSize} selected</span>}
                  </div>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="size-label">
                    {product.sizes.map(size => {
                      const inStock = sizeInStock(size);
                      const selected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          role="radio"
                          aria-checked={selected}
                          aria-label={inStock ? `Size ${size}` : `Size ${size}, sold out`}
                          className={`min-w-[48px] h-11 px-3 text-sm border transition-colors duration-fast ${inStock ? '' : 'line-through opacity-40'}
                            ${selected
                              ? 'border-cs-accent bg-cs-accent text-brand-black'
                              : 'border-cs-border-strong text-cs-text hover:border-cs-accent hover:text-cs-accent'
                            }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {missingHint && (
                <p className="text-xs text-amber-300" role="alert">{missingHint}</p>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <h2 className={labelCls}>Qty</h2>
              <div className="flex items-center border border-cs-border-strong">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center text-cs-muted hover:text-cs-accent transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-cs-text" aria-live="polite" aria-label={`Quantity ${quantity}`}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(q + 1, Math.max(1, available), 99))} aria-label="Increase quantity"
                  disabled={selectionComplete && quantity >= available}
                  className="w-11 h-11 flex items-center justify-center text-cs-muted hover:text-cs-accent transition-colors disabled:opacity-30">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-cs-muted">
                Total: <span className="cs-price">{formatPrice(product.finalPrice * quantity)}</span>
              </span>
              {stockMessage && <span className="text-xs w-full">{stockMessage}</span>}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                ref={addButtonRef}
                onClick={handleAddToCart}
                disabled={adding || optionSoldOut || soldOut}
                className={`flex-1 h-14 font-medium uppercase tracking-[0.2em] text-xs transition-colors duration-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border ${
                  addedToCart
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'bg-brand-canvas text-brand-black border-transparent hover:bg-cs-bg hover:text-cs-text hover:border-cs-text'
                }`}
              >
                {addedToCart ? <Check className="w-4 h-4" /> : !soldOut && <ShoppingCart className="w-4 h-4" />}
                {addLabel}
              </button>
              <button
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={inWishlist}
                className={`w-14 h-14 flex items-center justify-center border transition-colors duration-fast
                  ${inWishlist ? 'border-cs-accent text-cs-accent' : 'border-cs-border-strong text-cs-text hover:border-cs-accent hover:text-cs-accent'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-px bg-cs-border border border-cs-border">
              {[
                { Icon: Truck,     label: 'Free Shipping', sub: `Over ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
                { Icon: RefreshCw, label: '30-Day Returns', sub: 'Easy returns' },
                { Icon: Shield,    label: 'Secure',        sub: 'Cash on delivery' },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 py-4 px-1 bg-cs-bg">
                  <Icon className="w-5 h-5 text-cs-accent mb-0.5" aria-hidden />
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-cs-text leading-tight">{label}</p>
                  <p className="text-[10px] text-cs-muted">{sub}</p>
                </div>
              ))}
            </div>

            {(product.specifications.length > 0 || product.material) && (
              <div className="bg-cs-surface border border-cs-border p-5">
                <h2 className={`${labelCls} mb-4`}>Details &amp; Care</h2>
                <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
                  {(product.specifications.length ? product.specifications : [{ key: 'Material', value: product.material }]).map(s => (
                    <React.Fragment key={s.key}>
                      <dt className="text-cs-muted">{s.key}</dt>
                      <dd className="text-cs-text">{s.value}</dd>
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

      {/* MOBILE STICKY CART BAR — appears once the main button scrolls away */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[#121212]/[0.98] border-t border-cs-border px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex items-center gap-3"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: duration.base, ease }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-cs-muted truncate">{product.name}</p>
              <p className="cs-price text-base">{formatPrice(product.finalPrice * quantity)}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || optionSoldOut || soldOut}
              className="h-12 px-6 bg-brand-canvas text-brand-black text-xs font-medium uppercase tracking-[0.18em] disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
            >
              {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {addedToCart ? 'Added' : soldOut ? 'Sold Out' : !selectionComplete ? 'Select options' : adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            role="dialog" aria-modal="true" aria-label="Image viewer"
          >
            <button onClick={() => setLightbox(false)} aria-label="Close" autoFocus
              className="absolute top-4 right-4 z-10 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {selectedImage + 1} / {images.length}
            </div>
            <button onClick={e => { e.stopPropagation(); lightboxPrev(); }} aria-label="Previous image"
              className="absolute left-2 sm:left-4 z-10 w-11 h-11 bg-white/10 hover:bg-cs-accent hover:text-brand-black rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <motion.div className="max-w-3xl w-full max-h-[85vh] mx-14" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: duration.fast }}>
              <SafeImage key={selectedImage} src={images[selectedImage]} alt={product.name} eager
                wrapperClassName="w-full aspect-[3/4] max-h-[85vh] bg-transparent"
                className="w-full h-full object-contain" />
            </motion.div>
            <button onClick={e => { e.stopPropagation(); lightboxNext(); }} aria-label="Next image"
              className="absolute right-2 sm:right-4 z-10 w-11 h-11 bg-white/10 hover:bg-cs-accent hover:text-brand-black rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" onClick={e => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button key={img + idx} onClick={() => setSelectedImage(idx)} aria-label={`Show image ${idx + 1}`}
                  className={`w-11 h-11 overflow-hidden border transition-colors ${selectedImage === idx ? 'border-cs-accent' : 'border-white/20 hover:border-white/50'}`}>
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
  const [formOpen, setFormOpen] = useState(false);

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
      setFormOpen(false);
      setPage(1);
      reload();
    } catch (err) {
      notify.error('Review not posted', errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;
  const empty = !loading && items.length === 0;

  const formPanel = (
    <div className="bg-cs-surface border border-cs-border p-5 md:p-6">
      <h3 className={`${labelCls} mb-4`}>Write a Review</h3>
      {isAuthenticated ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex -mx-2" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map(n => (
              <button type="button" key={n} onClick={() => setForm(f => ({ ...f, rating: n }))} aria-label={`${n} star${n > 1 ? 's' : ''}`} role="radio" aria-checked={form.rating === n}
                className="w-11 h-11 flex items-center justify-center">
                <Star className={`w-6 h-6 ${n <= form.rating ? 'text-cs-accent fill-current' : 'text-white/25'}`} />
              </button>
            ))}
          </div>
          <input value={form.title} maxLength={120} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (optional)" aria-label="Review title"
            className="w-full bg-transparent border-b border-cs-border-strong py-2.5 text-sm text-cs-text placeholder-white/40 focus:outline-none focus:border-cs-accent" />
          <textarea value={form.comment} maxLength={2000} rows={4} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="What did you think?" aria-label="Your review"
            className="w-full bg-transparent border border-cs-border-strong p-3 text-sm text-cs-text placeholder-white/40 focus:outline-none focus:border-cs-accent" />
          <button disabled={submitting} className="w-full h-12 bg-brand-canvas text-brand-black text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-50 hover:bg-cs-accent transition-colors">
            {submitting ? 'Posting…' : 'Post Review'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-cs-muted">
          <Link to={`/auth?redirect=/product/${product.slug}`} className="text-cs-accent underline underline-offset-4">Log in</Link> to write a review.
        </p>
      )}
    </div>
  );

  return (
    <section id="reviews" className="mt-16 md:mt-20 border-t border-cs-border pt-12 md:pt-14 scroll-mt-28" aria-labelledby="reviews-title">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="cs-eyebrow mb-3">Reviews</p>
          <h2 id="reviews-title" className="text-xl md:text-2xl text-cs-text">Customer Reviews</h2>
        </div>
        {product.ratingCount > 0 && (
          <p className="text-sm text-cs-muted">
            {product.ratingAverage.toFixed(1)} out of 5 · {product.ratingCount} review{product.ratingCount === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {empty ? (
        // No reviews yet: a single button instead of an empty box.
        <div>
          {!formOpen ? (
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 h-12 px-6 border border-cs-accent/50 text-cs-accent text-xs uppercase tracking-[0.2em] hover:bg-cs-accent hover:text-brand-black transition-colors duration-fast"
              aria-expanded={formOpen}
            >
              <PenLine className="w-4 h-4" /> Be the first to review
            </button>
          ) : (
            <div className="max-w-lg">{formPanel}</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading && !items.length ? <Spinner label="Loading reviews" /> : items.map(review => (
              <div key={review.id} className="bg-cs-surface border border-cs-border p-5 md:p-6">
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  <span className="flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-cs-accent fill-current' : 'text-white/20'}`} aria-hidden />
                    ))}
                  </span>
                  {review.title && <span className="ml-3 text-sm text-cs-text">{review.title}</span>}
                </div>
                {review.comment && <p className="text-cs-muted text-sm leading-relaxed mb-4">“{review.comment}”</p>}
                <div className="flex items-center justify-between text-xs text-cs-muted gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-cs-text uppercase tracking-[0.12em]">{review.name}</span>
                    {review.verifiedPurchase && <span className="text-emerald-400">✓ Verified purchase</span>}
                  </div>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {hasMore && (
              <button onClick={() => setPage(p => p + 1)} disabled={loading}
                className="w-full h-12 border border-cs-border-strong text-xs uppercase tracking-[0.2em] text-cs-muted hover:text-cs-accent">
                {loading ? 'Loading…' : 'Show more reviews'}
              </button>
            )}
          </div>
          <div className="h-fit">{formPanel}</div>
        </div>
      )}
    </section>
  );
};

const RelatedProducts: React.FC<{ productId: string }> = ({ productId }) => {
  const { data, loading } = useApi(() => productsApi.related(productId, 4), [productId]);
  const items = useMemo(() => data || [], [data]);
  if (!loading && !items.length) return null;
  return (
    <section className="mt-16 md:mt-20 border-t border-cs-border pt-12 md:pt-14" aria-labelledby="related-title">
      <p className="cs-eyebrow mb-3">More to Explore</p>
      <h2 id="related-title" className="text-xl md:text-2xl text-cs-text mb-8">You May Also Like</h2>
      {loading ? <ProductGridSkeleton count={4} className="grid-cols-2 lg:grid-cols-4 !gap-3 md:!gap-6" /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {items.map((p, i) => (
            <Reveal key={p.id} index={i} className="h-full"><ProductCard product={p} /></Reveal>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductDetail;
