import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const orderNumber = `CS${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            {/* Main Message */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed and is being processed.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Order Number:</span>
                  <span className="font-semibold text-slate-900">#{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Order Date:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Estimated Delivery:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="text-left mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Order Processing</p>
                    <p className="text-slate-600 text-sm">We're preparing your items for shipment.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Shipping Confirmation</p>
                    <p className="text-slate-600 text-sm">You'll receive tracking information via email.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Delivery</p>
                    <p className="text-slate-600 text-sm">Your order will arrive in 3-5 business days.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <Link
                to="/shop"
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="btn-outline flex items-center justify-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Track Order</span>
              </button>
            </div>

            {/* Email Notification */}
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 bg-blue-50 rounded-lg p-3">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>A confirmation email has been sent to your email address.</span>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div>
                <h4 className="font-medium text-slate-900 mb-1">Customer Support</h4>
                <p className="text-slate-600 text-sm mb-2">Monday - Friday, 9AM - 6PM EST</p>
                <a href="tel:+15551234567" className="text-slate-900 hover:text-slate-700 font-medium">
                  +1 (555) 123-4567
                </a>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-1">Email Support</h4>
                <p className="text-slate-600 text-sm mb-2">We'll respond within 24 hours</p>
                <a href="mailto:support@cstyle.com" className="text-slate-900 hover:text-slate-700 font-medium">
                  support@cstyle.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;