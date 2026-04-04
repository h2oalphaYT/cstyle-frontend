import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: 'M', // Default size
      color: 'Black' // Default color
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <Heart className="w-24 h-24 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your wishlist is empty</h2>
            <p className="text-slate-600 mb-8">
              Save items you love to your wishlist and shop them later.
            </p>
            <Link to="/shop" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">
          My Wishlist ({items.length} items)
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
              <Link to={`/product/${item.id}`} className="block">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
              </Link>

              <div className="p-4">
                <Link to={`/product/${item.id}`}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 hover:text-slate-700 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-slate-500 mb-2">{item.category}</p>
                <p className="text-xl font-bold text-slate-900 mb-4">
                  ${item.price.toFixed(2)}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/shop" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;