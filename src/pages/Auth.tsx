import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
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

  const inputClass =
    'w-full pl-9 pr-4 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/25 focus:outline-none transition-colors duration-300';

  const labelClass =
    'block text-[10px] font-medium text-brand-muted mb-1.5 uppercase tracking-[0.2em]';

  return (
    <div className="min-h-[calc(100vh-140px)] bg-brand-black flex items-center justify-center py-10 md:py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-brand-surface border border-white/6 overflow-hidden shadow-2xl"
      >
        {/* Left Editorial Visual (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-brand-black flex-col justify-between p-10">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
            alt="cStyle Luxury Fashion"
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent" />

          <div className="relative z-10">
            <p className="text-brand-champagne uppercase tracking-[0.35em] text-[10px]">Privilege</p>
            <h3 className="text-xl font-light text-white uppercase tracking-[0.15em] mt-2">
              The Atelier Experience
            </h3>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="h-px w-10 bg-brand-champagne" />
            <p className="text-brand-muted text-xs tracking-wide leading-relaxed">
              &ldquo;Fashion is the instant language of elegance and individuality.&rdquo;
            </p>
            <div className="flex items-center gap-2 text-[10px] text-brand-champagne uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sri Lanka&apos;s Finest</span>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Header (No repeated logo) */}
          <div className="mb-6">
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-[10px] mb-1">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </p>
            <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-[0.15em]">
              {isLogin ? 'Sign In To Account' : 'Join The Club'}
            </h2>
            <p className="mt-2 text-xs text-brand-muted tracking-wide">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  loginForm.reset();
                  signupForm.reset();
                }}
                className="text-brand-champagne hover:text-white uppercase tracking-[0.15em] transition-colors duration-300 ml-1 font-medium underline underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Form Switcher */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              /* Login Form */
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className={labelClass}>Email Address</label>
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
                      className={inputClass}
                      placeholder="enter your email"
                    />
                    <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400/80 text-[10px] mt-1 tracking-wide">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      {...loginForm.register('password', { required: 'Password is required' })}
                      type={showPassword ? 'text' : 'password'}
                      className={`${inputClass} pr-9`}
                      placeholder="enter your password"
                    />
                    <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-muted hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-400/80 text-[10px] mt-1 tracking-wide">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-brand-champagne bg-transparent border-white/20 rounded-sm"
                    />
                    <span className="ml-2 text-brand-muted tracking-wide text-[11px]">Remember me</span>
                  </label>
                  <a href="#" className="text-brand-muted hover:text-brand-champagne tracking-wide text-[11px] transition-colors">
                    Forgot password?
                  </a>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-brand-canvas text-brand-black py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-brand-black"></div>
                      Signing in…
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              /* Signup Form */
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <input
                      {...signupForm.register('name', { required: 'Name is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="enter your full name"
                    />
                    <User className="absolute left-0 top-1/2 transform -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                  </div>
                  {signupForm.formState.errors.name && (
                    <p className="text-red-400/80 text-[10px] mt-1 tracking-wide">
                      {signupForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
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
                      className={inputClass}
                      placeholder="enter your email"
                    />
                    <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-red-400/80 text-[10px] mt-1 tracking-wide">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        {...signupForm.register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Min 8 characters'
                          }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className={`${inputClass} pr-8`}
                        placeholder="password"
                      />
                      <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-muted hover:text-white transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-red-400/80 text-[10px] mt-1 tracking-wide">
                        {signupForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative">
                      <input
                        {...signupForm.register('confirmPassword', {
                          required: 'Confirm password'
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`${inputClass} pr-8`}
                        placeholder="confirm"
                      />
                      <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-brand-muted w-3.5 h-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-muted hover:text-white transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-red-400/80 text-[10px] mt-1 tracking-wide">
                        {signupForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="h-3.5 w-3.5 accent-brand-champagne bg-transparent border-white/20 rounded-sm mt-0.5"
                    />
                    <span className="ml-2 text-[10px] text-brand-muted leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-white hover:text-brand-champagne transition-colors">
                        Terms
                      </a>{' '}
                      &amp;{' '}
                      <a href="#" className="text-white hover:text-brand-champagne transition-colors">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-brand-canvas text-brand-black py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-brand-black"></div>
                      Creating account…
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social Login */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[9px] text-brand-muted uppercase tracking-[0.2em] mb-3">
              Or Continue With
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button className="py-2.5 px-4 border border-white/12 text-[11px] font-light uppercase tracking-[0.15em] text-brand-muted hover:text-white hover:border-brand-champagne transition-colors duration-300">
                Google
              </button>
              <button className="py-2.5 px-4 border border-white/12 text-[11px] font-light uppercase tracking-[0.15em] text-brand-muted hover:text-white hover:border-brand-champagne transition-colors duration-300">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;