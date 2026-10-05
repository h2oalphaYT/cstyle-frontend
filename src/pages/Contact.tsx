import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { errorMessage, http } from '../api/client';
import { useNotify } from '../context/NotificationContext';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>();
  const notify = useNotify();

  const onSubmit = async (data: ContactFormData) => {
    try {
      await http.post('/contact', data);
      setIsSubmitted(true);
      reset();
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      notify.error('Message not sent', errorMessage(err));
    }
  };

  const inputClass =
    'w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-sm placeholder-white/25 focus:outline-none transition-colors duration-300';

  const labelClass =
    'block text-[10px] font-medium text-brand-muted mb-2 uppercase tracking-[0.22em]';

  return (
    <div className="min-h-screen bg-brand-black">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="Contact cStyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/65 via-brand-black/50 to-brand-black" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-brand-champagne uppercase tracking-[0.4em] text-xs mb-5">We're Listening</p>
            <h1
              className="font-light text-white uppercase tracking-[0.15em] mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300 }}
            >
              Contact Us
            </h1>
            <div className="h-px w-12 bg-brand-champagne mx-auto mb-5" />
            <p className="text-brand-muted text-sm tracking-wide max-w-md mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="luxury-container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* ── INFO COLUMN ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <div>
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-3">Get in Touch</p>
              <h2 className="text-xl font-light text-white uppercase tracking-[0.15em] mb-4">
                Reach Out
              </h2>
              <div className="h-px w-8 bg-brand-champagne mb-5" />
              <p className="text-brand-muted text-sm leading-relaxed">
                Have a question, suggestion, or just want to say hello? We're here to help and would love to hear from you.
              </p>
            </div>

            <div className="space-y-7">
              {[
                {
                  Icon: MapPin,
                  title: 'Visit Our Store',
                  lines: ['123 Fashion Street', 'Colombo 03, Sri Lanka']
                },
                {
                  Icon: Phone,
                  title: 'Call Us',
                  lines: ['+94 11 234 5678', 'Mon–Fri 9AM–6PM']
                },
                {
                  Icon: Mail,
                  title: 'Email Us',
                  lines: ['hello@cstyle.lk', 'support@cstyle.lk']
                },
                {
                  Icon: Clock,
                  title: 'Store Hours',
                  lines: ['Mon–Fri: 10AM–8PM', 'Sat: 10AM–6PM', 'Sun: 12PM–5PM']
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-9 h-9 border border-brand-champagne/25 flex items-center justify-center flex-shrink-0">
                    <item.Icon className="w-3.5 h-3.5 text-brand-champagne" />
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-light uppercase tracking-[0.18em] mb-1.5">{item.title}</h3>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-brand-muted text-xs leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-[10px] text-brand-muted uppercase tracking-[0.2em] mb-4">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { label: 'f', href: '#' },
                  { label: 'ig', href: '#' },
                  { label: 'tw', href: '#' }
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-9 h-9 border border-white/12 flex items-center justify-center text-brand-muted hover:border-brand-champagne hover:text-brand-champagne transition-colors duration-300 text-xs uppercase tracking-wide"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── FORM + FAQ COLUMN ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 space-y-12"
          >
            {/* Form Card */}
            <div className="bg-brand-surface border border-white/6 p-10">
              <div className="mb-8">
                <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-3">Drop a Line</p>
                <h2 className="text-xl font-light text-white uppercase tracking-[0.15em]">
                  Send Us a Message
                </h2>
              </div>

              {/* Success Banner */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 px-5 py-4 border border-brand-champagne/30 bg-brand-champagne/5 flex items-center gap-3"
                  >
                    <Check className="w-4 h-4 text-brand-champagne flex-shrink-0" />
                    <p className="text-brand-champagne text-xs tracking-wide">
                      Thank you for your message. We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className={inputClass}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className={inputClass}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className={labelClass}>Subject *</label>
                  <select
                    {...register('subject', { required: 'Please select a subject' })}
                    className={`${inputClass} cursor-pointer appearance-none`}
                  >
                    <option value="" className="bg-brand-black">Select a subject</option>
                    <option value="general" className="bg-brand-black">General Inquiry</option>
                    <option value="order" className="bg-brand-black">Order Support</option>
                    <option value="returns" className="bg-brand-black">Returns & Exchanges</option>
                    <option value="sizing" className="bg-brand-black">Sizing Help</option>
                    <option value="wholesale" className="bg-brand-black">Wholesale Inquiry</option>
                    <option value="press" className="bg-brand-black">Press & Media</option>
                    <option value="other" className="bg-brand-black">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us how we can help you…"
                  />
                  {errors.message && (
                    <p className="text-red-400/80 text-[10px] mt-1.5 tracking-wide">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-brand-black hover:text-brand-canvas rounded-sm border border-transparent hover:border-brand-canvas transition-all duration-400 group disabled:opacity-50"
                  style={{ transition: 'background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease' }}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                </motion.button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <div className="mb-7">
                <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-3">FAQs</p>
                <h3 className="text-lg font-light text-white uppercase tracking-[0.15em]">
                  Frequently Asked Questions
                </h3>
              </div>
              <div className="space-y-px bg-white/5">
                {[
                  {
                    question: 'What is your return policy?',
                    answer: 'We offer a 30-day return policy for all items in original condition with tags attached.'
                  },
                  {
                    question: 'How long does shipping take?',
                    answer: 'Standard shipping takes 3–5 business days. Express shipping is available for 1–2 business days.'
                  },
                  {
                    question: 'Do you offer international shipping?',
                    answer: 'Yes, we ship to over 25 countries worldwide. Shipping costs and times vary by destination.'
                  },
                  {
                    question: 'How do I track my order?',
                    answer: "You'll receive a tracking number via email once your order ships. You can track it on our website or the carrier's site."
                  }
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                    className="bg-brand-surface p-7 group hover:bg-brand-black transition-colors duration-400"
                  >
                    <h4 className="text-white text-xs font-light uppercase tracking-[0.18em] mb-2.5 group-hover:text-brand-champagne transition-colors duration-300">
                      {faq.question}
                    </h4>
                    <p className="text-brand-muted text-xs leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-brand-surface border border-white/6 p-8">
              <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs mb-3">Location</p>
              <h3 className="text-sm font-light text-white uppercase tracking-[0.18em] mb-6">Find Our Store</h3>
              <div className="h-52 bg-brand-black border border-white/8 flex items-center justify-center mb-5">
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-brand-champagne/40 mx-auto mb-2" />
                  <p className="text-brand-muted text-xs tracking-wide">Interactive map</p>
                </div>
              </div>
              <p className="text-brand-muted text-xs tracking-wide text-center">
                Our flagship store in Colombo's fashion district
                <br />
                <span className="text-white">123 Fashion Street, Colombo 03, Sri Lanka</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;