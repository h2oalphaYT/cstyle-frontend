import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Truck,
  RefreshCw,
  Award,
  Shield,
  Zap,
  Star,
  Quote
} from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
      title: 'ELITE FASHION',
      subtitle: 'MADE IN SRI LANKA',
      cta: 'EXPLORE COLLECTION'
    },
    {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
      title: 'PREMIUM QUALITY',
      subtitle: 'LUXURY REDEFINED',
      cta: 'SHOP NOW'
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80',
      title: 'TRENDING NOW',
      subtitle: 'LATEST COLLECTION',
      cta: 'DISCOVER MORE'
    }
  ];

  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 8);
  const newArrivals = products.filter(product => product.isNew).slice(0, 4);
  const saleProducts = products.filter(product => product.isFeatured || product.isNew).slice(4, 8);

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Countdown timer for flash sale
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="min-h-screen bg-black">
      {/* HERO SECTION - Full Screen with Bold Typography */}
      <section className="relative h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-70 z-10" />
              <motion.img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: index === currentSlide ? 1.1 : 1 }}
                transition={{ duration: 8, ease: "linear" }}
              />
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center px-4">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {/* Animated Gold Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "80px" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mx-auto mb-8"
              />

              {/* Main Title */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-2xl">
                  {heroSlides[currentSlide].title}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-2xl md:text-4xl font-bold text-white mb-12 tracking-wide">
                {heroSlides[currentSlide].subtitle}
              </p>

              {/* CTA Button */}
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(250, 204, 21, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-12 py-6 text-xl font-black uppercase tracking-widest overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group"
            >
              <div className={`h-1 transition-all duration-500 ${index === currentSlide
                ? 'w-20 bg-gradient-to-r from-yellow-400 to-yellow-600'
                : 'w-10 bg-gray-500 group-hover:bg-gray-400'
                }`} />
            </button>
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center text-yellow-400"
        >
          <span className="text-xs uppercase tracking-widest mb-3 font-bold">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-yellow-400 to-transparent" />
        </motion.div>
      </section>

      {/* EXPLOSIVE FEATURES SECTION */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-600 rounded-full blur-3xl" />
        </div>

        <div className="luxury-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                WHY CHOOSE US
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: Truck, title: 'FREE SHIPPING', desc: 'On orders over Rs 32,500', color: 'from-yellow-400 to-yellow-600' },
              { Icon: RefreshCw, title: 'EASY RETURNS', desc: '30-day money back', color: 'from-yellow-500 to-orange-500' },
              { Icon: Shield, title: 'SECURE PAYMENT', desc: '100% protected', color: 'from-yellow-400 to-yellow-500' },
              { Icon: Award, title: 'PREMIUM QUALITY', desc: 'Crafted to perfection', color: 'from-yellow-500 to-yellow-700' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group relative p-8 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500 transition-all duration-300"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity blur-xl`} />

                <div className="relative z-10">
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                    <feature.Icon className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 font-medium">{feature.desc}</p>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLOSIVE CATEGORIES */}
      <section className="py-32 bg-black relative">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                SHOP BY CATEGORY
              </span>
            </h2>
            <p className="text-xl text-gray-400 font-bold uppercase tracking-wider">
              Find Your Perfect Style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'MEN', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80', count: '120+' },
              { name: 'WOMEN', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', count: '200+' },
              { name: 'KIDS', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80', count: '80+' }
            ].map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Link
                  to={`/shop?category=${category.name}`}
                  className="group relative block overflow-hidden aspect-[3/4]"
                >
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Yellow Accent Border */}
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-500 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <motion.h3
                      whileHover={{ scale: 1.1 }}
                      className="text-5xl md:text-6xl font-black mb-3 uppercase tracking-wider group-hover:text-yellow-400 transition-colors"
                    >
                      {category.name}
                    </motion.h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-3" />
                    <p className="text-yellow-400 text-xl font-bold">{category.count} ITEMS</p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 SPECIAL OFFERS SECTION - MORE SUBTLE 🔥 */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden border-t-2 border-yellow-400">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>

        <div className="luxury-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  LIMITED TIME OFFERS
                </span>
              </h2>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>

            <p className="text-xl text-gray-300 font-bold mb-6">
              Save up to 50% on selected items
            </p>

            {/* Countdown Timer - Smaller & Subtle */}
            <div className="flex justify-center gap-3 md:gap-6 mb-10">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((time, i) => (
                <motion.div
                  key={time.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/60 backdrop-blur-lg px-4 py-3 border-2 border-yellow-400/50"
                >
                  <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">
                    {String(time.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {time.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sale Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 items-stretch">
              {saleProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-12 py-4 text-lg font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all"
              >
                View All Offers
                <ArrowRight className="inline-block w-6 h-6 ml-3" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section className="py-32 bg-brand-black relative">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                NEW ARRIVALS
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6" />
            <p className="text-xl text-gray-400 font-bold uppercase tracking-wider">
              Fresh Styles Just Dropped
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {newArrivals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLOSIVE CATEGORIES */}
      <section className="py-32 bg-black relative">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                SHOP BY CATEGORY
              </span>
            </h2>
            <p className="text-xl text-gray-400 font-bold uppercase tracking-wider">
              Find Your Perfect Style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'MEN', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80', count: '120+' },
              { name: 'WOMEN', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', count: '200+' },
              { name: 'KIDS', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80', count: '80+' }
            ].map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Link
                  to={`/shop?category=${category.name}`}
                  className="group relative block overflow-hidden aspect-[3/4]"
                >
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Yellow Accent Border */}
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-500 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <motion.h3
                      whileHover={{ scale: 1.1 }}
                      className="text-5xl md:text-6xl font-black mb-3 uppercase tracking-wider group-hover:text-yellow-400 transition-colors"
                    >
                      {category.name}
                    </motion.h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-3" />
                    <p className="text-yellow-400 text-xl font-bold">{category.count} ITEMS</p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS - EXPLOSIVE GRID */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                FEATURED COLLECTION
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6" />
            <p className="text-xl text-gray-400 font-bold uppercase tracking-wider">
              Handpicked Premium Pieces
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(250, 204, 21, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-12 py-6 text-xl font-black uppercase tracking-widest"
              >
                VIEW ALL PRODUCTS
                <ArrowRight className="inline-block w-6 h-6 ml-3" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - BOLD & VIBRANT */}
      <section className="py-32 bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-yellow-600 rounded-full blur-3xl" />
        </div>

        <div className="luxury-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                CUSTOMER REVIEWS
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6" />
            <p className="text-xl text-gray-400 font-bold uppercase tracking-wider">
              Loved by Thousands
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                rating: 5,
                comment: 'Amazing quality and fast shipping! The dress fits perfectly and the fabric is so comfortable. Best purchase ever!',
                location: 'Colombo'
              },
              {
                name: 'Mike Chen',
                rating: 5,
                comment: 'Best online shopping experience ever. Great customer service and beautiful products. Highly recommend!',
                location: 'Kandy'
              },
              {
                name: 'Emily Davis',
                rating: 5,
                comment: 'Love the sustainable approach and the clothes are stylish and durable. Premium quality guaranteed!',
                location: 'Galle'
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative p-8 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500 transition-all duration-300"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />

                <div className="relative z-10">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star key={starIndex} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <Quote className="w-10 h-10 text-yellow-500 mb-4" />

                  {/* Comment */}
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    "{testimonial.comment}"
                  </p>

                  {/* Author */}
                  <div className="border-t-2 border-gray-800 pt-4">
                    <p className="text-white font-black text-xl uppercase tracking-wide">
                      {testimonial.name}
                    </p>
                    <p className="text-yellow-400 font-bold text-sm uppercase">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-500/20 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BOLD CTA SECTION */}
      <section className="py-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-3xl" />
        </motion.div>

        <div className="luxury-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
              READY TO ELEVATE<br />YOUR STYLE?
            </h2>
            <p className="text-2xl text-black font-bold mb-12 max-w-2xl mx-auto">
              Join thousands of satisfied customers and experience premium fashion
            </p>
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(0, 0, 0, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-black text-yellow-400 px-16 py-8 text-2xl font-black uppercase tracking-widest border-4 border-black hover:border-yellow-400 transition-all"
              >
                SHOP NOW
                <ArrowRight className="inline-block w-8 h-8 ml-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;