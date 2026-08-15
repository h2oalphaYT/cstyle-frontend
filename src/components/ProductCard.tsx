import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, ZoomIn } from 'lucide-react';
import { Product } from '../data/products';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useTheme();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0],
      color: product.colors[0]
    });
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

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative flex flex-col h-full overflow-hidden bg-brand-surface border border-white/6 rounded-none transition-all duration-400"
        onMouseEnter={() => {
          setIsHovered(true);
          if (product.images.length > 1) setImageIndex(1);
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
            <motion.img
              key={imageIndex}
              src={imageIndex === 0 ? product.image : (product.images[1] ?? product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: isHovered ? 1.08 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
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
            {product.isNew && (
              <span className="bg-brand-champagne text-brand-black text-[9px] px-2 py-0.5 font-medium uppercase tracking-[0.2em]">
                New
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-white/10 text-white backdrop-blur-sm border border-white/20 text-[9px] px-2 py-0.5 font-medium uppercase tracking-[0.2em]">
                Sale
              </span>
            )}
          </div>

          {/* ── Wishlist heart ── */}
          <motion.button
            className={`absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-colors duration-200
              ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-black/60 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-500'}`}
            onClick={handleWishlistToggle}
            initial={{ opacity: 0, scale: 0.7, x: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.7, x: isHovered ? 0 : 10 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {/* ── MIMOSA-STYLE PILL BUTTONS ── centered on image hover ── */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            {/* Quick View pill */}
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="group/btn"
            >
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.28, delay: 0.08 }}
                className="flex items-center gap-2 bg-white/95 dark:bg-black/90 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl hover:bg-brand-gold hover:text-brand-black transition-all duration-200 backdrop-blur-md border border-white/30"
              >
                <Eye className="w-3.5 h-3.5" />
                Quick View
              </motion.div>
            </Link>

            {/* Quick Shop pill */}
            <motion.button
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.28, delay: 0.14 }}
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-brand-canvas text-brand-black text-xs font-medium uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl hover:bg-brand-champagne transition-all duration-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Quick Shop
            </motion.button>
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
          {/* Category */}
          <p className="text-[10px] text-brand-champagne uppercase tracking-[0.2em] mb-1 font-light">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="text-xs font-light text-white uppercase tracking-[0.15em] mb-2 leading-snug line-clamp-2 min-h-[2.25rem] group-hover:text-brand-champagne transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating row */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-brand-gold fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              ({product.reviews})
            </span>
          </div>

          {/* Spacer pushes price row to bottom */}
          <div className="flex-1" />

          {/* Price + Color swatches — fixed min-height so sale/no-sale cards align */}
          <div className="flex items-center justify-between min-h-[2.25rem]">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-light text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-brand-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Color dots */}
            {product.colors.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {product.colors.slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: getColorHex(color) }}
                    title={color}
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