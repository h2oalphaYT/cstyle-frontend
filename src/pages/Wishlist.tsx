import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { errorMessage, productsApi } from '../api';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useNotify } from '../context/NotificationContext';
import { useApi } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import SafeImage from '../components/SafeImage';
import { ProductGridSkeleton } from '../components/StateViews';

const Wishlist: React.FC = () => {
  const { items, removeFromWishlist, loading } = useWishlist();
  const { formatPrice } = useTheme();
  const notify = useNotify();
  const { data: recommended } = useApi(() => productsApi.list({ featured: true, limit: 4 }), []);

  const remove = async (id: string, name: string) => {
    try {
      await removeFromWishlist(id);
      notify.info('Removed from wishlist', name);
    } catch (err) {
      notify.error('Wishlist not updated', errorMessage(err));
    }
  };

  const recommendedProducts = (recommended || []).filter(p => !items.some(i => i.id === p.id));

  return (
    <div className="min-h-screen bg-brand-black py-12 md:py-16">
      <div className="luxury-container space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-white/6 pb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div>
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-2">Saved Items</p>
            <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em]">
              My Wishlist ({items.length})
            </h1>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300 flex items-center gap-2">
            <span>Explore All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {loading && items.length === 0 ? <ProductGridSkeleton count={4} /> : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl mx-auto text-center bg-brand-surface border border-white/6 p-10 md:p-12 space-y-6"
          >
            <div className="w-14 h-14 border border-brand-champagne/30 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-brand-champagne" />
            </div>
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px] mb-1">Your Collection</p>
              <h2 className="text-xl md:text-2xl font-light text-white uppercase tracking-[0.15em]">Your Wishlist is Empty</h2>
            </div>
            <p className="text-brand-muted text-xs tracking-wide leading-relaxed max-w-md mx-auto">
              Save your favorite pieces as you browse our collections and return to them anytime.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300">
              Discover Collection
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="group bg-brand-surface border border-white/6 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <Link to={`/product/${item.slug || item.id}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-black">
                    <SafeImage src={item.thumbnail} alt={item.name} wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    {item.stock <= 0 && (
                      <span className="absolute top-3 left-3 bg-black/70 text-white border border-white/20 text-[9px] px-2 py-0.5 uppercase tracking-[0.2em]">Sold Out</span>
                    )}
                  </Link>
                  <div className="p-6">
                    <p className="text-[10px] text-brand-champagne uppercase tracking-[0.2em] mb-1">{item.category?.name}</p>
                    <Link to={`/product/${item.slug || item.id}`}>
                      <h3 className="text-xs font-light text-white uppercase tracking-[0.15em] mb-2 hover:text-brand-champagne transition-colors duration-300 line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm font-light text-white">
                      {formatPrice(item.finalPrice)}
                      {item.onSale && <span className="ml-2 text-xs text-brand-muted line-through">{formatPrice(item.price)}</span>}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <Link
                    to={`/product/${item.slug || item.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-canvas text-brand-black py-3 text-xs font-medium uppercase tracking-[0.18em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Choose Options</span>
                  </Link>
                  <button
                    onClick={() => remove(item.id, item.name)}
                    className="p-3 border border-white/10 text-brand-muted hover:text-red-400 hover:border-red-400/40 transition-colors duration-300"
                    title="Remove from wishlist"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {recommendedProducts.length > 0 && (
          <div className="pt-8 border-t border-white/6 space-y-8">
            <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px] mb-1">Curated For You</p>
                <h2 className="text-2xl font-light text-white uppercase tracking-[0.15em] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-champagne" />
                  Recommended Pieces
                </h2>
              </div>
              <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300">
                View All Products &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
