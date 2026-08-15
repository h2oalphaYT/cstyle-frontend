import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: 'M',
      color: 'Black'
    });
  };

  const recommendedProducts = products.filter(p => p.isFeatured).slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-black py-12 md:py-16">
      <div className="luxury-container space-y-16">
        {/* Header */}
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
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-champagne transition-colors duration-300 flex items-center gap-2"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Empty Wishlist State */}
        {items.length === 0 ? (
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
              <h2 className="text-xl md:text-2xl font-light text-white uppercase tracking-[0.15em]">
                Your Wishlist is Empty
              </h2>
            </div>
            <p className="text-brand-muted text-xs tracking-wide leading-relaxed max-w-md mx-auto">
              Save your favorite pieces as you browse our collections and return to them anytime.
            </p>
            <Link to="/shop">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300"
              >
                Discover Collection
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Grid */
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
                  <Link to={`/product/${item.id}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-black">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-transparent transition-colors duration-300" />
                  </Link>

                  <div className="p-6">
                    <p className="text-[10px] text-brand-champagne uppercase tracking-[0.2em] mb-1">
                      {item.category}
                    </p>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-xs font-light text-white uppercase tracking-[0.15em] mb-2 hover:text-brand-champagne transition-colors duration-300 line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm font-light text-white">
                      Rs {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-canvas text-brand-black py-3 text-xs font-medium uppercase tracking-[0.18em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-3 border border-white/10 text-brand-muted hover:text-red-400 hover:border-red-400/40 transition-colors duration-300"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Curated Recommendations Section (Fills page, prevents empty black void) */}
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
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;