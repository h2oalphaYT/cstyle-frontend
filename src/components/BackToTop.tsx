import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { duration, ease } from '../design/tokens';

/**
 * Floating back-to-top button. Appears after two screens of scrolling, sits above any fixed
 * bottom bar (--cs-bottom-bar) and is hidden on product pages on mobile, where the sticky
 * cart bar lives.
 */
const BackToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => setIsDesktop(mq.matches);
    mq.addEventListener?.('change', onMq);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setVisible(window.scrollY > window.innerHeight * 2);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mq.removeEventListener?.('change', onMq);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const hiddenHere = !isDesktop && pathname.startsWith('/product/');

  return (
    <AnimatePresence>
      {visible && !hiddenHere && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: duration.fast, ease }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-4 lg:right-8 z-40 w-11 h-11 bg-cs-surface text-cs-accent border border-cs-accent/40 hover:bg-cs-accent hover:text-brand-black shadow-2xl flex items-center justify-center transition-colors duration-fast"
          style={{ bottom: 'calc(20px + var(--cs-bottom-bar) + env(safe-area-inset-bottom, 0px))' }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
