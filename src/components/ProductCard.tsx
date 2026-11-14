import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import type { Product } from '../api';
import { errorMessage } from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNotify } from '../context/NotificationContext';
import { duration, ease } from '../design/tokens';
import { canHoverFine, prefersReducedMotion } from '../motion';
import { imageIndexForColor } from '../utils/colorImage';
import SafeImage from './SafeImage';

interface ProductCardProps {
  product: Product;
  /** Load the image eagerly (first row above the fold). */
  eager?: boolean;
}

/** Maximum tilt toward the cursor, in degrees. */
const MAX_TILT = 6;

const ProductCard = ({ product, eager = false }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useTheme();
  const notify = useNotify();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  useEffect(() => {
    setTiltEnabled(canHoverFine() && !prefersReducedMotion());
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const images = product.images?.length ? product.images : [product.thumbnail];
  const outOfStock = product.stock <= 0;
  const productUrl = `/product/${product.slug || product.id}`;
  const inWishlist = isInWishlist(product.id);
  const baseIndex = pickedColor ? imageIndexForColor(product, pickedColor) : 0;
  const shownIndex = isHovered && !pickedColor && images.length > 1 ? 1 : (pickedColor ? baseIndex : imageIndex);
  const maxSwatches = 3;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const added = await toggleWishlist(product);
      notify.success(added ? 'Saved to wishlist' : 'Removed from wishlist', product.name);
    } catch (err) {
      notify.error('Wishlist not updated', errorMessage(err));
    }
  };

  // Quick shop adds single-option products directly; products with size/colour choices open the product page.
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.find(v => v.stock > 0);
    const hasChoices = product.sizes.length > 1 || product.colors.length > 1;
    if (hasChoices || (product.variants?.length && !variant)) {
      navigate(productUrl);
      return;
    }
    try {
      await addToCart({ product, size: variant?.size, color: variant?.color, quantity: 1 });
      notify.success('Added to cart', product.name);
    } catch (err) {
      notify.error('Could not add to cart', errorMessage(err));
    }
  };

  const pickColor = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPickedColor(prev => (prev === name ? null : name));
  };

  // 3D tilt toward the cursor (desktop pointer only). CSS variables avoid re-rendering per move.
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const el = cardRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });
  }, [tiltEnabled]);

  const handleEnter = () => {
    setIsHovered(true);
    cardRef.current?.classList.add('is-tilting');
  };
  const handleLeave = () => {
    setIsHovered(false);
    setImageIndex(0);
    cancelAnimationFrame(frame.current);
    const el = cardRef.current;
    if (el) {
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    }
  };

  const hoverable = tiltEnabled;

  return (
    <Link to={productUrl} className="group block h-full focus-visible:outline-none">
      <div
        ref={cardRef}
        className={`cs-tilt relative flex flex-col h-full bg-cs-surface border border-cs-border group-focus-visible:border-cs-accent ${isHovered && hoverable ? 'is-hovered' : ''}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
      >
        {/* ── IMAGE ── */}
        <div className="relative overflow-hidden aspect-[3/4] bg-cs-tile">
          <AnimatePresence initial={false}>
            <motion.div
              key={shownIndex}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: isHovered && hoverable ? 1.04 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease }}
            >
              <SafeImage
                src={images[shownIndex] ?? images[0]}
                alt={product.name}
                eager={eager}
                width={600}
                height={800}
                wrapperClassName="w-full h-full bg-cs-tile"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Soft light sheen that follows the cursor */}
          <div className="cs-sheen absolute inset-0 pointer-events-none z-10" aria-hidden />

          {/* ── Badges ── */}
          <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10">
            {product.newArrival && (
              <span className="bg-cs-accent text-brand-black text-[10px] px-2 py-0.5 font-medium uppercase tracking-[0.18em]">New</span>
            )}
            {product.onSale && product.discountPercent > 0 && (
              <span className="bg-brand-black text-white border border-cs-accent/60 text-[10px] px-2 py-0.5 font-semibold tracking-[0.12em]">
                -{product.discountPercent}%
              </span>
            )}
            {outOfStock && (
              <span className="bg-brand-black text-white border border-white/25 text-[10px] px-2 py-0.5 font-medium uppercase tracking-[0.18em]">Sold Out</span>
            )}
          </div>

          {/* ── Wishlist (44×44 tap area, visible circle stays compact) ── */}
          <button
            className="absolute top-0 right-0 z-20 w-11 h-11 flex items-center justify-center"
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={inWishlist}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors duration-fast
              ${inWishlist ? 'bg-brand-black text-cs-accent' : 'bg-white/90 text-brand-black hover:bg-white'}`}>
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </span>
          </button>

          {/* ── Quick actions slide up on hover (desktop) ── */}
          <div className="absolute inset-x-0 bottom-0 hidden md:flex gap-2 p-3 z-20 pointer-events-none">
            <motion.span
              initial={false}
              animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: duration.fast, ease }}
              className="pointer-events-auto flex-1 flex items-center justify-center gap-2 bg-brand-black/90 text-white text-[11px] uppercase tracking-[0.16em] h-10"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </motion.span>
            {!outOfStock && (
              <motion.button
                initial={false}
                animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: duration.fast, ease, delay: isHovered ? 0.05 : 0 }}
                onClick={handleAddToCart}
                tabIndex={isHovered ? 0 : -1}
                className="pointer-events-auto flex-1 flex items-center justify-center gap-2 bg-brand-canvas text-brand-black text-[11px] uppercase tracking-[0.16em] h-10 hover:bg-cs-accent transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Quick Shop
              </motion.button>
            )}
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="flex flex-col flex-1 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
          <p className="text-[10px] text-cs-accent uppercase tracking-[0.2em] mb-1 truncate">
            {product.category?.name || product.subCategory}
          </p>

          <h3 className="!text-[11px] sm:!text-xs !font-light text-cs-text !tracking-[0.12em] mb-2 leading-snug line-clamp-2 min-h-[2.1rem] group-hover:text-cs-accent transition-colors duration-fast">
            {product.name}
          </h3>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2" role="img" aria-label={`Rated ${product.ratingAverage.toFixed(1)} out of 5 from ${product.ratingCount} review${product.ratingCount === 1 ? '' : 's'}`}>
              <div className="flex" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.ratingAverage) ? 'text-cs-accent fill-current' : 'text-white/20'}`} />
                ))}
              </div>
              <span className="text-[11px] text-cs-muted" aria-hidden>({product.ratingCount})</span>
            </div>
          )}

          <div className="flex-1" />

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="cs-price text-sm">{formatPrice(product.finalPrice)}</span>
            {product.onSale && (
              <span className="text-xs text-cs-muted line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {product.colors.length > 0 && (
            <div className="flex items-center -mx-2.5 mt-0.5" role="group" aria-label="Colours">
              {product.colors.slice(0, maxSwatches).map((color) => {
                const active = pickedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={(e) => pickColor(e, color.name)}
                    className="w-11 h-11 flex items-center justify-center"
                    aria-label={`Show ${color.name}`}
                    aria-pressed={active}
                    title={color.name}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border transition-shadow duration-fast ${active ? 'border-cs-accent ring-2 ring-cs-accent ring-offset-2 ring-offset-cs-surface' : 'border-white/30'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                );
              })}
              {product.colors.length > maxSwatches && (
                <span className="text-[11px] text-cs-muted pl-1">+{product.colors.length - maxSwatches}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
