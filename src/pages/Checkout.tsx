import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      email: user?.email || '',
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      country: 'US'
    }
  });

  const subtotal = totalPrice;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      navigate('/order-success');
      setIsProcessing(false);
    }, 3000);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Shipping Address</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address *
                  </label>
                  <input
                    {...register('address', { required: 'Address is required' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      State *
                    </label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Country *
                  </label>
                  <select
                    {...register('country', { required: 'Country is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-2" />
                Payment Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name on Card *
                  </label>
                  <input
                    {...register('nameOnCard', { required: 'Name on card is required' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                  {errors.nameOnCard && (
                    <p className="text-red-500 text-sm mt-1">{errors.nameOnCard.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    {...register('cardNumber', { 
                      required: 'Card number is required',
                      pattern: {
                        value: /^[0-9\s]{13,19}$/,
                        message: 'Please enter a valid card number'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      {...register('expiryDate', { 
                        required: 'Expiry date is required',
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                          message: 'Please enter MM/YY format'
                        }
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CVV *
                    </label>
                    <input
                      {...register('cvv', { 
                        required: 'CVV is required',
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: 'Please enter a valid CVV'
                        }
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm text-slate-600">
                <Lock className="w-4 h-4 text-green-500 mr-2" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-slate-500 text-xs">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 pt-6 border-t">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Place Order • $${total.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;