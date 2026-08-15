import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Truck,
  RefreshCw,
  Award,
  Shield,
  Star,
  Quote
} from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import MagneticButton from '../components/MagneticButton';

// Detect pointer device (disable parallax on touch-only)
const canHover =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover)').matches;

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // ── Mouse-tracking refs & springs ────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: -9999, y: -9999 });
  const [heroHovered, setHeroHovered] = useState(false);

  const rawX = useSpring(0, { stiffness: 45, damping: 20, mass: 1 });
  const rawY = useSpring(0, { stiffness: 45, damping: 20, mass: 1 });

  // Background drifts opposite to cursor (max ±2%)
  const bgX = useTransform(rawX, [-0.5, 0.5], ['-2%', '2%']);
  const bgY = useTransform(rawY, [-0.5, 0.5], ['-2%', '2%']);

  // Foreground text drifts same direction, smaller offset
  const fgX = useTransform(rawX, [-0.5, 0.5], [-14, 14]);
  const fgY = useTransform(rawY, [-0.5, 0.5], [-8, 8]);

  const handleHeroMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!canHover || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      // Normalised -0.5 → 0.5
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      rawX.set(nx);
      rawY.set(ny);
      setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [canHover, rawX, rawY]
  );

  const handleHeroMouseEnter = () => { if (canHover) setHeroHovered(true); };
  const handleHeroMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setHeroHovered(false);
  };
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
      {/* HERO SECTION — Parallax + Spotlight + Magnetic CTA */}
      <section
        ref={heroRef}
        className="relative h-screen overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={handleHeroMouseEnter}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* ── Background Slides with parallax drift ── */}
        <motion.div
          className="absolute inset-0"
          style={canHover ? { x: bgX, y: bgY, scale: 1.06 } : { scale: 1.06 }}
        >
          {heroSlides.map((slide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 via-brand-black/50 to-brand-black/80 z-10" />
              <motion.img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.05 }}
                animate={{ scale: index === currentSlide ? 1.12 : 1.05 }}
                transition={{ duration: 10, ease: 'linear' }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Ambient Spotlight overlay ── */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(197,168,128,0.07), transparent 70%)`,
            opacity: heroHovered ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* ── Hero Content with foreground parallax ── */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <motion.div
            className="text-center px-4 max-w-4xl"
            style={canHover ? { x: fgX, y: fgY } : {}}
          >
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Champagne rule */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '48px' }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-px bg-brand-champagne mx-auto mb-10"
              />

              {/* Eyebrow */}
              <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs font-light mb-5">
                {heroSlides[currentSlide].subtitle}
              </p>

              {/* Main Title */}
              <h1
                className="font-light text-white mb-8 leading-[1.05] tracking-[0.15em] uppercase"
                style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
              >
                {heroSlides[currentSlide].title}
              </h1>

              {/* Magnetic CTA */}
              <MagneticButton maxDistance={14} stiffness={150} damping={15}>
                <Link to="/shop">
                  <motion.button
                    whileHover={{ backgroundColor: '#121212', color: '#FAFAFA' }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-sm group"
                    style={{ transition: 'background-color 0.35s ease, color 0.35s ease' }}
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </Link>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group"
              aria-label={`Slide ${index + 1}`}
            >
              <div className={`h-px transition-all duration-500 ${
                index === currentSlide
                  ? 'w-16 bg-brand-champagne'
                  : 'w-8 bg-white/30 group-hover:bg-white/60'
              }`} />
            </button>
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-10 right-12 hidden lg:flex flex-col items-center text-brand-muted gap-2 z-20"
        >
          <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-brand-muted/60 to-transparent" />
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-brand-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-champagne rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-champagne rounded-full blur-3xl" />
        </div>

        <div className="luxury-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-light text-white uppercase tracking-[0.15em] mb-4">
              The Cstyle Difference
            </h2>
            <div className="h-px w-16 bg-brand-champagne mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/6">
            {[
              { Icon: Truck, title: 'Free Shipping', desc: 'On orders over Rs 32,500' },
              { Icon: RefreshCw, title: 'Easy Returns', desc: '30-day money back' },
              { Icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { Icon: Award, title: 'Premium Quality', desc: 'Crafted to perfection' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 bg-brand-black hover:bg-brand-surface transition-colors duration-500 text-center"
              >
                <div className="w-10 h-10 mx-auto mb-6 flex items-center justify-center border border-brand-champagne/30 group-hover:border-brand-champagne transition-colors duration-500">
                  <feature.Icon className="w-4 h-4 text-brand-champagne" />
                </div>
                <h3 className="text-sm font-light text-white mb-2 uppercase tracking-[0.2em]">
                  {feature.title}
                </h3>
                <p className="text-brand-muted text-xs tracking-wide">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES - Refined */}
      <section className="py-32 bg-brand-surface relative">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Collections</p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Shop by Category
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {[
              { name: 'MEN', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80', count: '120+' },
              { name: 'WOMEN', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', count: '200+' },
              { name: 'KIDS', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80', count: '80+' }
            ].map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link
                  to={`/shop?category=${category.name}`}
                  className="group relative block overflow-hidden aspect-[3/4]"
                >
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-brand-champagne group-hover:w-full transition-all duration-700" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-white">
                    <h3 className="text-2xl font-light uppercase tracking-[0.3em] mb-2 group-hover:text-brand-champagne transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-brand-muted text-xs tracking-[0.2em] uppercase">{category.count} Items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIMITED OFFERS SECTION - Refined */}
      <section className="py-20 bg-brand-black relative overflow-hidden border-t border-brand-champagne/20">
        <div className="luxury-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Flash Deals</p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Limited Time Offers
            </h2>
            <p className="text-brand-muted text-sm tracking-wide mb-8">
              Save up to 50% on selected items
            </p>

            {/* Countdown Timer - Refined */}
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
                  className="border border-brand-champagne/25 px-5 py-3 bg-brand-surface"
                >
                  <div className="text-2xl md:text-3xl font-light text-white mb-1 tabular-nums">
                    {String(time.value).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] font-medium text-brand-muted uppercase tracking-[0.2em]">
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
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 border border-brand-champagne/40 text-brand-champagne px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-brand-champagne hover:text-brand-black transition-all duration-400"
              >
                View All Offers
                <ArrowRight className="w-3.5 h-3.5" />
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
            className="text-center mb-16"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Just Dropped</p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-4">
              New Arrivals
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-sm tracking-wide">
              Fresh styles, refined craftsmanship
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

      {/* SECOND CATEGORIES SECTION - Refined */}
      <section className="py-32 bg-brand-surface relative">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Explore</p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Shop by Category
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {[
              { name: 'MEN', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80', count: '120+' },
              { name: 'WOMEN', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', count: '200+' },
              { name: 'KIDS', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80', count: '80+' }
            ].map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link
                  to={`/shop?category=${category.name}`}
                  className="group relative block overflow-hidden aspect-[3/4]"
                >
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-brand-champagne group-hover:w-full transition-all duration-700" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-white">
                    <h3 className="text-2xl font-light uppercase tracking-[0.3em] mb-2 group-hover:text-brand-champagne transition-colors duration-400">
                      {category.name}
                    </h3>
                    <p className="text-brand-muted text-xs tracking-[0.2em] uppercase">{category.count} Items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="py-32 bg-brand-black">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Curated Picks</p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Featured Collection
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-sm tracking-wide">
              Handpicked premium pieces
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

          <div className="text-center mt-14">
            <Link to="/shop">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-brand-black hover:text-brand-canvas transition-all duration-400 rounded-sm"
                style={{ transition: 'background-color 0.35s ease, color 0.35s ease' }}
              >
                View All Products
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 bg-brand-surface relative overflow-hidden">
        <div className="luxury-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Customer Reviews
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-sm tracking-wide">Loved by thousands</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
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
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group p-10 bg-brand-surface hover:bg-brand-black transition-colors duration-500"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-3.5 h-3.5 text-brand-champagne fill-brand-champagne" />
                  ))}
                </div>

                {/* Quote */}
                <Quote className="w-6 h-6 text-brand-champagne/40 mb-4" />

                {/* Comment */}
                <p className="text-brand-muted text-sm mb-8 leading-relaxed">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* Author */}
                <div className="border-t border-white/8 pt-5">
                  <p className="text-white font-light text-sm uppercase tracking-[0.15em]">
                    {testimonial.name}
                  </p>
                  <p className="text-brand-champagne text-[10px] uppercase tracking-[0.2em] mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION - Refined Dark */}
      <section className="py-32 bg-brand-black relative overflow-hidden">
        {/* Subtle champagne orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-champagne/5 rounded-full blur-3xl" />
        </div>

        <div className="luxury-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs mb-8">Ready?</p>
            <h2
              className="font-light text-white mb-8 leading-tight uppercase tracking-[0.12em]"
              style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 300 }}
            >
              Elevate Your Style
            </h2>
            <p className="text-brand-muted text-sm tracking-wide mb-14 max-w-md mx-auto">
              Join thousands of satisfied customers and experience premium fashion made in Sri Lanka.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/shop">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-12 py-5 text-xs font-medium uppercase tracking-[0.22em] hover:bg-brand-black hover:text-brand-canvas border border-transparent hover:border-brand-canvas rounded-sm transition-all duration-400 group"
                  style={{ transition: 'background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease' }}
                >
                  Shop Now
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 border border-brand-muted/30 text-brand-muted px-12 py-5 text-xs font-medium uppercase tracking-[0.22em] hover:border-brand-champagne hover:text-brand-champagne rounded-sm transition-all duration-400"
                >
                  Our Story
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;