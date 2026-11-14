/**
 * Storefront design tokens. The colour, radius and spacing values are also defined as CSS
 * variables in index.css (:root --cs-*) and exposed to Tailwind as `cs-*` classes, so the
 * three always agree. Use these constants for JS-driven motion (framer-motion, canvas).
 */
export const colors = {
  bg: '#121212',
  surface: '#1a1a1a',
  surfaceRaised: '#202020',
  border: 'rgba(255,255,255,0.08)',
  text: '#f5f5f5',
  muted: '#9a9a9a',
  /** The existing muted gold ("champagne"). */
  accent: '#C5A880',
  accentStrong: '#A88B65',
  /** Cream product-tile background. */
  tile: '#EFEBE3',
} as const;

export const radius = { base: 2, lg: 6 } as const;

/** 4px-based spacing scale, in px. */
export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64] as const;

/** Motion durations in seconds (framer-motion) — fast 200ms, base 400ms, slow 600ms. */
export const duration = { fast: 0.2, base: 0.4, slow: 0.6, reveal: 0.5, page: 0.25 } as const;

/** Signature ease: cubic-bezier(0.22, 1, 0.36, 1). */
export const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
export const easeCss = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Stagger between cards in a revealed group, in seconds. */
export const stagger = 0.06;
