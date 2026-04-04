import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const loginForm = useForm<LoginFormData>();
  const signupForm = useForm<SignupFormData>();

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    try {
      await signup(data.email, data.password, data.name);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">cS</span>
            </div>
            <span className="text-3xl font-bold text-slate-900">cStyle</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {isLogin ? (
            /* Login Form */
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...loginForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...loginForm.register('password', { required: 'Password is required' })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    {...signupForm.register('name', { required: 'Name is required' })}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {signupForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...signupForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...signupForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...signupForm.register('confirmPassword', {
                      required: 'Please confirm your password'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded mt-1"
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    I agree to the{' '}
                    <a href="#" className="text-slate-900 hover:text-slate-700 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-slate-900 hover:text-slate-700 font-medium">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>
          )}

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-gray-50">
                <span>Google</span>
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-gray-50">
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;