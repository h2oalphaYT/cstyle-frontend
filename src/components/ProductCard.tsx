import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, ZoomIn } from 'lucide-react';
import type { Product } from '../api';
import { errorMessage } from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNotify } from '../context/NotificationContext';
import SafeImage from './SafeImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useTheme();
  const notify = useNotify();
  const navigate = useNavigate();

  const images = product.images?.length ? product.images : [product.thumbnail];
  const outOfStock = product.stock <= 0;
  const productUrl = `/product/${product.slug || product.id}`;
  const inWishlist = isInWishlist(product.id);

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

  return (
    <Link to={productUrl} className="group block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative flex flex-col h-full overflow-hidden bg-brand-surface border border-white/6 rounded-none transition-all duration-400"
        onMouseEnter={() => {
          setIsHovered(true);
          if (images.length > 1) setImageIndex(1);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setImageIndex(0);
        }}
      >
        {/* ── IMAGE AREA ── */}
        <div className="relative overflow-hidden aspect-[3/4]">

          {/* Primary / Secondary Image Swap */}
          <AnimatePresence mode="sync">
            <motion.div
              key={imageIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: isHovered ? 1.08 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <SafeImage
                src={images[imageIndex] ?? images[0]}
                alt={product.name}
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gold Glow Highlight on hover — Mimosa effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, transparent 60%, rgba(212,175,55,0.10) 100%)',
              boxShadow: 'inset 0 0 40px rgba(212,175,55,0.15)',
            }}
          />

          {/* Dark gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* ── Badges ── */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.newArrival && (
              <span className="bg-brand-champagne text-brand-black text-[9px] px-2 py-0.5 font-medium uppercase tracking-[0.2em]">
                New
              </span>
            )}
            {product.onSale && (
              <span className="bg-white/10 text-white backdrop-blur-sm border border-white/20 text-[9px] px-2 py-0.5 font-medium uppercase tracking-[0.2em]">
                -{product.discountPercent}%
              </span>
            )}
            {outOfStock && (
              <span className="bg-black/70 text-white border border-white/20 text-[9px] px-2 py-0.5 font-medium uppercase tracking-[0.2em]">
                Sold Out
              </span>
            )}
          </div>

          {/* ── Wishlist heart (always visible on touch screens) ── */}
          <motion.button
            className={`absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-colors duration-200
              ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-black/60 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-500'}`}
            onClick={handleWishlistToggle}
            initial={false}
            animate={{ opacity: isHovered || inWishlist ? 1 : 0.85, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {/* ── MIMOSA-STYLE PILL BUTTONS ── centered on image hover ── */}
          <motion.div
            className="absolute inset-0 hidden md:flex flex-col items-center justify-center gap-2 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <span className="pointer-events-auto">
              <motion.span
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.28, delay: 0.08 }}
                className="flex items-center gap-2 bg-white/95 dark:bg-black/90 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl hover:bg-brand-gold hover:text-brand-black transition-all duration-200 backdrop-blur-md border border-white/30"
              >
                <Eye className="w-3.5 h-3.5" />
                Quick View
              </motion.span>
            </span>

            {!outOfStock && (
              <motion.button
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.28, delay: 0.14 }}
                onClick={handleAddToCart}
                className="pointer-events-auto flex items-center gap-2 bg-brand-canvas text-brand-black text-xs font-medium uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl hover:bg-brand-champagne transition-all duration-200"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Quick Shop
              </motion.button>
            )}
          </motion.div>

          {/* ── Zoom hint corner ── */}
          <motion.div
            className="absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.9 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </motion.div>

          {/* Champagne bottom sweep bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-brand-champagne"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
          />
        </div>

        {/* ── CARD INFO ── */}
        <div className="flex flex-col flex-1 px-4 pt-4 pb-5 bg-brand-surface">
          <p className="text-[10px] text-brand-champagne uppercase tracking-[0.2em] mb-1 font-light">
            {product.category?.name || product.subCategory}
          </p>

          <h3 className="text-xs font-light text-white uppercase tracking-[0.15em] mb-2 leading-snug line-clamp-2 min-h-[2.25rem] group-hover:text-brand-champagne transition-colors duration-200">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(product.ratingAverage) ? 'text-brand-gold fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              ({product.ratingCount})
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center justify-between min-h-[2.25rem]">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-light text-white">
                {formatPrice(product.finalPrice)}
              </span>
              {product.onSale && (
                <span className="text-xs text-brand-muted line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {product.colors.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {product.colors.slice(0, 4).map((color) => (
                  <div
                    key={color.name}
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-gray-400 ml-0.5">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
