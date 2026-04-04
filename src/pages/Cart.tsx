import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/shop" className="btn-primary">
              Start Shopping
              <ArrowRight className="inline-block w-5 h-5 ml-2" />
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
          Shopping Cart ({totalItems} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {item.name}
                    </h3>
                    <div className="text-sm text-slate-600 mb-2">
                      <span>Size: {item.size}</span>
                      <span className="mx-2">•</span>
                      <span>Color: {item.color}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        className="p-2 text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        className="p-2 text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-4 flex justify-between items-center pt-4 border-t">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-lg font-semibold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold">
                    {totalPrice >= 100 ? 'Free' : '$9.99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold">${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">
                    ${(totalPrice + (totalPrice >= 100 ? 0 : 9.99) + (totalPrice * 0.08)).toFixed(2)}
                  </span>
                </div>
              </div>

              {totalPrice < 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    Add ${(100 - totalPrice).toFixed(2)} more to get free shipping!
                  </p>
                </div>
              )}

              <Link
                to="/checkout"
                className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/shop"
                className="w-full btn-outline text-center block"
              >
                Continue Shopping
              </Link>

              {/* Security Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;