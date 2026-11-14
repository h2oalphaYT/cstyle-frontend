/**
 * Storefront motion primitives. Everything here respects prefers-reduced-motion:
 * reveals show immediately, counters jump to their final value, and tilt is disabled.
 */
import React, { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { duration, easeCss, stagger as STAGGER } from '../design/tokens';

const mql = (query: string) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query) : null);

export const prefersReducedMotion = () => !!mql('(prefers-reduced-motion: reduce)')?.matches;

/** Live prefers-reduced-motion value. */
export const useReducedMotionPref = () => {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const m = mql('(prefers-reduced-motion: reduce)');
    if (!m) return undefined;
    const on = () => setReduced(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return reduced;
};

/** True on devices with a fine pointer that can hover (desktop mouse / trackpad). */
export const canHoverFine = () => !!mql('(hover: hover) and (pointer: fine)')?.matches;

// ── Scroll reveal ─────────────────────────────────────────────────────────
// One shared IntersectionObserver for every revealed element on the page.
type RevealCallback = () => void;
const callbacks = new WeakMap<Element, RevealCallback>();
let observer: IntersectionObserver | null = null;

const getObserver = () => {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      callbacks.get(entry.target)?.();
      callbacks.delete(entry.target);
      observer?.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  return observer;
};

/** Returns a ref and whether the element has entered the viewport (fires once). */
export const useInViewOnce = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el || !io) { setInView(true); return undefined; }
    callbacks.set(el, () => setInView(true));
    io.observe(el);
    return () => { callbacks.delete(el); io.unobserve(el); };
  }, []);
  return [ref, inView] as const;
};

interface RevealProps {
  children: ReactNode;
  /** Position within a group; each step adds a 60ms delay. */
  index?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Fades and lifts its content (translateY 24px → 0, 500ms) the first time it scrolls into view.
 * Staggered by `index` (60ms per step, capped so long lists don't lag).
 */
export const Reveal: React.FC<RevealProps> = ({ children, index = 0, as: Tag = 'div', className = '', style, id }) => {
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const delay = Math.min(index, 8) * STAGGER;
  return (
    <Tag
      ref={ref}
      id={id}
      className={`cs-reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ ...style, '--reveal-delay': `${delay}s`, '--reveal-dur': `${duration.reveal}s`, '--reveal-ease': easeCss } as CSSProperties}
    >
      {children}
    </Tag>
  );
};

// ── Count up ──────────────────────────────────────────────────────────────
/** Animates the leading number of `value` (e.g. "125+") from 0 when it scrolls into view. */
export const CountUp: React.FC<{ value: string; durationMs?: number; className?: string; style?: CSSProperties }> = ({ value, durationMs = 1400, className, style }) => {
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[2]) : 0;
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const [current, setCurrent] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (!inView || !match) return undefined;
    if (prefersReducedMotion()) { setCurrent(target); return undefined; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, durationMs]);

  if (!match) return <span className={className} style={style}>{value}</span>;
  return (
    <span ref={ref} className={className} style={style}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>{match[1]}{current}{match[3]}</span>
    </span>
  );
};
