import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Users, Target, ShieldCheck, ArrowRight, MapPin, Scissors, Shirt, Truck, ClipboardList, Star, Heart } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const img = (name: string) => `/images/story/${name}.webp`;

const STATS = [
  { value: '35', label: 'Years of industry experience' },
  { value: '125+', label: 'Finished pieces every day' },
  { value: '15+', label: 'Skilled team members' },
  { value: '35+', label: 'Completed shipments' }
];

const VALUES = [
  { Icon: Award, label: 'Quality', text: 'Every garment is checked before it leaves the floor, so each piece matches the order exactly.' },
  { Icon: Target, label: 'Precision', text: 'Careful cutting and stitching to each client’s specification, one seam at a time.' },
  { Icon: ShieldCheck, label: 'Integrity', text: 'Honest timelines, clear communication and a culture of continuous improvement.' },
  { Icon: Users, label: 'Our People', text: 'We grow by empowering our team and giving back to our community in Pitigala.' }
];

const MACHINERY = [
  { count: '7', name: 'Single Needle Juki (Auto)' },
  { count: '1', name: 'Button Hole Juki (Auto)' },
  { count: '1', name: 'Button Attach Juki' },
  { count: '2', name: 'Siruba 5-Thread Overlock' },
  { count: '1', name: 'Cutting Machine' },
  { count: '16 ft', name: 'Cutting Table' },
  { count: '1', name: 'Iron Table Set' },
  { count: '3', name: 'Bottle Irons' }
];

const PROCESS = [
  {
    Icon: ClipboardList,
    title: 'Planning the order',
    text: 'When a shipment arrives, our team goes through the delivery details with the supervisor. Tasks are assigned and daily targets are set so every order runs smoothly.'
  },
  {
    Icon: Scissors,
    title: 'Cutting & stitching',
    text: 'Designs are reviewed and finalised against the specification and quality standard. Fabric is cut to the pattern, then stitched and finished on our Juki and Siruba lines.'
  },
  {
    Icon: Truck,
    title: 'Quality check & delivery',
    text: 'Each garment is inspected for quality and accuracy, then labelled, packed and handed to our logistics partners for timely delivery to retailers and customers.'
  }
];

const GALLERY = [
  { src: img('sewing-floor'), alt: 'Sewing line at the CStyle factory', className: 'md:row-span-2' },
  { src: img('cutting-table'), alt: 'Team laying fabric on the 16-foot cutting table', className: 'md:col-span-2' },
  { src: img('stitching'), alt: 'Machine operator stitching a floral garment', className: '' },
  { src: img('finished-shirts'), alt: 'Finished printed shirts on a rack', className: '' }
];

const SectionTitle: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({ eyebrow, title, sub }) => (
  <motion.div {...fadeUp} className="text-center mb-16">
    <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">{eyebrow}</p>
    <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-4">{title}</h2>
    <div className="h-px w-12 bg-brand-champagne mx-auto" />
    {sub && <p className="text-brand-muted text-sm tracking-wide mt-4 max-w-xl mx-auto">{sub}</p>}
  </motion.div>
);

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-black">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[460px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={img('storefront')} alt="CStyle (Pvt) Ltd factory in New Town, Pitigala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-brand-black/60 to-brand-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-brand-champagne uppercase tracking-[0.4em] text-xs mb-5 inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> New Town, Pitigala · Sri Lanka
            </p>
            <h1 className="font-light text-white uppercase tracking-[0.15em] mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 300 }}>
              Our Story
            </h1>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-6" />
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              A Sri Lankan garment maker built on 35 years of experience, a skilled team, and a simple promise: every piece made right.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE ────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-black">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Who We Are</p>
              <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-8">Made in Pitigala</h2>
              <div className="space-y-5 text-brand-muted leading-relaxed text-sm">
                <p>
                  CStyle (Pvt) Ltd is a garment manufacturer based in New Town, Pitigala. Our team of 15 dedicated people produces high-quality garments and specialises in sub-order clothing production for brands and retailers.
                </p>
                <p>
                  We focus on precision and attention to detail, making sure each piece meets our clients’ exact specifications. Our floor runs on modern Juki and Siruba machinery, which keeps quality high and production efficient.
                </p>
                <p>
                  Under the guidance of our founder, Mr. Ajith Siriwardena, CStyle continues to grow as a trusted name in apparel, and CStyle Collective brings that same craftsmanship straight to you.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="relative">
              <img src={img('shirt')} alt="A CStyle-made shirt" className="w-full h-[28rem] object-cover" loading="lazy" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-brand-champagne/30 -z-10" />
              <div className="absolute -top-4 -right-4 w-16 h-16 border border-brand-champagne/20 -z-10" />
              <div className="absolute -bottom-5 left-6 w-14 h-14 bg-brand-champagne flex items-center justify-center">
                <Shirt className="w-6 h-6 text-brand-black" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── NUMBERS ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-black border-t border-b border-white/6">
        <div className="luxury-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="bg-brand-black py-14 px-4 text-center"
              >
                <div className="font-light text-brand-champagne mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}>{stat.value}</div>
                <div className="text-brand-muted text-xs uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER ───────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-surface">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <motion.div {...fadeUp} className="relative lg:col-span-2">
              <div className="overflow-hidden aspect-[4/5]">
                <img src={img('ajith-siriwardena')} alt="Ajith Siriwardena, CEO and Founder of CStyle" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-28 h-28 border border-brand-champagne/30 -z-10" />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="lg:col-span-3">
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Meet the Founder</p>
              <h2 className="text-2xl md:text-4xl font-light text-white uppercase tracking-[0.15em] mb-2">Ajith Siriwardena</h2>
              <p className="text-brand-champagne text-[11px] uppercase tracking-[0.25em] mb-8">CEO / Founder</p>
              <div className="space-y-5 text-brand-muted leading-relaxed text-sm">
                <p>
                  Mr. Ajith Siriwardena brings over 35 years of experience in the apparel industry. He spent 25 of those years as a Maintenance Manager at one of Bangladesh’s leading apparel companies, where he mastered garment production from the machines up.
                </p>
                <p>
                  He brought that knowledge home to Pitigala to build CStyle. His leadership drives the company towards excellence and innovation, and his hands-on approach is felt on the factory floor every day.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/6 mt-10 max-w-md">
                <div className="bg-brand-surface py-6 text-center">
                  <div className="text-brand-champagne text-3xl font-light mb-1">35+</div>
                  <div className="text-brand-muted text-[10px] uppercase tracking-[0.2em]">Years in apparel</div>
                </div>
                <div className="bg-brand-surface py-6 text-center">
                  <div className="text-brand-champagne text-3xl font-light mb-1">25</div>
                  <div className="text-brand-muted text-[10px] uppercase tracking-[0.2em]">Years in Bangladesh</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────────────────── */}
      <section className="py-24 bg-brand-black">
        <div className="luxury-container">
          <SectionTitle eyebrow="What Drives Us" title="Mission & Vision" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/6">
            {[
              {
                Icon: Heart,
                label: 'Our Mission',
                text: 'To deliver high-quality garments that exceed customer expectations, fostering a culture of excellence, integrity and continuous improvement so that every piece we produce reflects our dedication to craftsmanship and customer satisfaction.'
              },
              {
                Icon: Star,
                label: 'Our Vision',
                text: 'To be a leading garment manufacturer recognised globally for our commitment to quality, innovation and sustainability, while empowering our team and enriching our community.'
              }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                {...fadeUp}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group p-12 bg-brand-black hover:bg-brand-surface transition-colors duration-500 text-center"
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

      {/* ── INSIDE THE FACTORY ───────────────────────────────────────── */}
      <section className="py-28 bg-brand-surface">
        <div className="luxury-container">
          <SectionTitle eyebrow="Inside CStyle" title="Our Factory Floor" sub="Where every CStyle garment is cut, stitched, checked and packed by our own team." />
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-1 md:h-[640px]">
            {GALLERY.map((g, i) => (
              <motion.div
                key={g.src}
                {...fadeUp}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`group overflow-hidden h-72 md:h-auto ${g.className}`}
              >
                <img src={g.src} alt={g.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-black">
        <div className="luxury-container">
          <SectionTitle eyebrow="How We Work" title="The Process" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/6">
            {PROCESS.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative p-10 bg-brand-black"
              >
                <span className="absolute top-6 right-8 text-5xl font-light text-white/5">0{i + 1}</span>
                <div className="w-12 h-12 bg-brand-champagne flex items-center justify-center mb-7">
                  <step.Icon className="w-5 h-5 text-brand-black" />
                </div>
                <h3 className="text-sm font-light text-white uppercase tracking-[0.2em] mb-4">{step.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MACHINERY ────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-surface">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} className="relative order-2 lg:order-1">
              <img src={img('juki-buttonhole')} alt="Juki automatic button hole machine" className="w-full h-[26rem] object-cover" loading="lazy" />
              <div className="absolute -top-4 -right-4 w-14 h-14 bg-brand-champagne flex items-center justify-center">
                <Scissors className="w-6 h-6 text-brand-black" />
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="order-1 lg:order-2">
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-4">Our Machinery</p>
              <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-[0.15em] mb-8">Built for Precision</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/6">
                {MACHINERY.map((m) => (
                  <li key={m.name} className="flex items-center gap-4 bg-brand-surface py-4 pr-4">
                    <span className="min-w-[3.5rem] text-brand-champagne text-xl font-light text-right">{m.count}</span>
                    <span className="text-white/85 text-xs uppercase tracking-[0.12em] leading-snug">{m.name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-black">
        <div className="luxury-container">
          <SectionTitle eyebrow="Principles" title="What We Stand For" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.label}
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

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-surface relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-champagne/4 rounded-full blur-3xl" />
        </div>
        <div className="luxury-container relative z-10 text-center">
          <motion.div {...fadeUp}>
            <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs mb-8">Work With Us</p>
            <h2 className="font-light text-white uppercase tracking-[0.12em] mb-6" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)', fontWeight: 300 }}>
              Wear the Craft
            </h2>
            <p className="text-brand-muted text-sm tracking-wide mb-12 max-w-lg mx-auto">
              Shop pieces made on our own floor, or talk to us about producing your next order.
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
