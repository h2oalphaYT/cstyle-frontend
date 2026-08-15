import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Users, Leaf, Globe, Heart, Star, ArrowRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-black">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden flex items-center justify-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="cStyle fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/55 to-brand-black" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-brand-champagne uppercase tracking-[0.4em] text-xs mb-5">Est. 2020 · Sri Lanka</p>
            <h1
              className="font-light text-white uppercase tracking-[0.15em] mb-6"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 300 }}
            >
              Our Story
            </h1>
            <div className="h-px w-12 bg-brand-champagne mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* ── OUR STORY ────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-black">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Who We Are</p>
              <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-8">
                Crafted with Purpose
              </h2>
              <div className="space-y-5 text-brand-muted leading-relaxed text-sm">
                <p>
                  Founded in 2020, cStyle emerged from a simple vision: to create fashion that doesn't compromise on quality, style, or sustainability. We believe great clothing should tell a story — your story.
                </p>
                <p>
                  As a premium garment manufacturer, we've built our reputation on delivering A-grade quality clothing that stands the test of time. Every piece is carefully crafted with attention to detail, using sustainable materials and ethical manufacturing practices.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide, offering collections that celebrate individuality while promoting conscious consumption and environmental responsibility.
                </p>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=700"
                alt="Fashion design process"
                className="w-full h-96 object-cover"
              />
              {/* Champagne accent corner */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-brand-champagne/30 -z-10" />
              <div className="absolute -top-4 -right-4 w-16 h-16 border border-brand-champagne/20 -z-10" />
              {/* Icon badge */}
              <div className="absolute -bottom-5 left-6 w-14 h-14 bg-brand-champagne flex items-center justify-center">
                <Award className="w-6 h-6 text-brand-black" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────────────────── */}
      <section className="py-24 bg-brand-surface">
        <div className="luxury-container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Foundation</p>
            <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Mission & Vision
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/6">
            {[
              {
                Icon: Heart,
                label: 'Our Mission',
                text: 'To democratize premium fashion by making high-quality, sustainable clothing accessible to everyone. We strive to create pieces that empower individuals to express their unique style while making responsible choices for our planet.'
              },
              {
                Icon: Star,
                label: 'Our Vision',
                text: "To become the world's most trusted fashion brand, known for exceptional quality, innovative design, and unwavering commitment to sustainability. We envision a future where fashion enhances lives without harming our environment."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group p-12 bg-brand-surface hover:bg-brand-black transition-colors duration-500 text-center"
              >
                <div className="w-12 h-12 border border-brand-champagne/30 group-hover:border-brand-champagne flex items-center justify-center mx-auto mb-7 transition-colors duration-500">
                  <item.Icon className="w-5 h-5 text-brand-champagne" />
                </div>
                <h3 className="text-sm font-light text-white uppercase tracking-[0.2em] mb-5">{item.label}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-black">
        <div className="luxury-container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Principles</p>
            <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Core Values
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-sm tracking-wide">These principles guide everything we do, from design to delivery</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              { Icon: Award, label: 'Quality First', text: 'We never compromise on quality. Every garment undergoes rigorous testing to ensure it meets our A-grade standards.' },
              { Icon: Leaf, label: 'Sustainability', text: 'Environmental responsibility is at our core. We use eco-friendly materials and sustainable manufacturing processes.' },
              { Icon: Users, label: 'Community', text: 'We believe in building strong relationships with our customers, partners, and the communities we serve.' },
              { Icon: Globe, label: 'Global Impact', text: 'Committed to making a positive impact globally through fair trade practices and ethical manufacturing.' }
            ].map((value, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group p-10 bg-brand-black hover:bg-brand-surface transition-colors duration-500 text-center"
              >
                <div className="w-10 h-10 border border-brand-champagne/25 group-hover:border-brand-champagne flex items-center justify-center mx-auto mb-6 transition-colors duration-500">
                  <value.Icon className="w-4 h-4 text-brand-champagne" />
                </div>
                <h3 className="text-xs font-light text-white uppercase tracking-[0.22em] mb-3">{value.label}</h3>
                <p className="text-brand-muted text-xs leading-relaxed">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUSTAINABILITY ────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-surface">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              className="relative order-2 lg:order-1"
            >
              <img
                src="https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=700"
                alt="Sustainable fashion"
                className="w-full h-96 object-cover"
              />
              <div className="absolute -top-4 -right-4 w-14 h-14 bg-brand-champagne flex items-center justify-center">
                <Leaf className="w-6 h-6 text-brand-black" />
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 lg:order-2"
            >
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Commitment</p>
              <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-8">
                Sustainable Fashion
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'Eco-Friendly Materials', text: 'We source organic cotton, recycled polyester, and other sustainable materials for our garments.' },
                  { title: 'Ethical Manufacturing', text: 'All our manufacturing partners adhere to fair labor practices and safe working conditions.' },
                  { title: 'Carbon Neutral Shipping', text: 'We offset 100% of our shipping emissions through verified carbon reduction projects.' },
                  { title: 'Circular Fashion', text: 'We encourage recycling and offer take-back programs for worn-out garments.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="w-5 h-5 border border-brand-champagne/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-brand-champagne text-[9px]">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-light uppercase tracking-[0.18em] mb-1.5">{item.title}</h4>
                      <p className="text-brand-muted text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-black border-t border-b border-white/6">
        <div className="luxury-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '100K+', label: 'Products Sold' },
              { value: '25+', label: 'Countries Served' },
              { value: '4.8', label: 'Average Rating' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="bg-brand-black py-14 text-center"
              >
                <div
                  className="font-light text-brand-champagne mb-3"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
                >
                  {stat.value}
                </div>
                <div className="text-brand-muted text-xs uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-surface">
        <div className="luxury-container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">The People</p>
            <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-4">
              Meet Our Team
            </h2>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-sm tracking-wide">The passionate people behind cStyle's success</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=500',
                bio: 'Fashion industry veteran with 15+ years of experience in sustainable design and manufacturing.'
              },
              {
                name: 'Michael Chen',
                role: 'Head of Design',
                image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=500',
                bio: 'Award-winning designer passionate about creating timeless pieces that blend style with functionality.'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Sustainability Director',
                image: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?w=500',
                bio: 'Environmental scientist dedicated to making fashion more sustainable and ethical.'
              }
            ].map((member, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group overflow-hidden bg-brand-surface"
              >
                <div className="overflow-hidden aspect-[4/5]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="p-7 border-t border-white/6">
                  <h3 className="text-sm font-light text-white uppercase tracking-[0.18em] mb-1">{member.name}</h3>
                  <p className="text-brand-champagne text-[10px] uppercase tracking-[0.22em] mb-3">{member.role}</p>
                  <p className="text-brand-muted text-xs leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-champagne/4 rounded-full blur-3xl" />
        </div>
        <div className="luxury-container relative z-10 text-center">
          <motion.div {...fadeUp}>
            <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs mb-8">Join Us</p>
            <h2
              className="font-light text-white uppercase tracking-[0.12em] mb-6"
              style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)', fontWeight: 300 }}
            >
              Join the Cstyle Community
            </h2>
            <p className="text-brand-muted text-sm tracking-wide mb-12 max-w-lg mx-auto">
              Experience the perfect blend of style, quality, and sustainability. Become part of the fashion revolution.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/shop">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-brand-black hover:text-brand-canvas rounded-sm transition-all duration-400 group border border-transparent hover:border-brand-canvas"
                  style={{ transition: 'background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease' }}
                >
                  Shop Now
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 border border-brand-muted/30 text-brand-muted px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:border-brand-champagne hover:text-brand-champagne rounded-sm transition-all duration-300"
                >
                  Get in Touch
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;