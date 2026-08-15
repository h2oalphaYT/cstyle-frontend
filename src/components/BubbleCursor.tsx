/**
 * BubbleCursor
 * Renders a water-bubble cursor trail across the entire page.
 * - Pure vanilla DOM bubble spawning (no React state per bubble = zero re-renders)
 * - Each bubble: fixed position, pointer-events: none, removed from DOM on animationend
 * - Touch/stylus devices: disabled via matchMedia hover check
 * - Min-distance threshold between spawns to avoid perf issues on fast moves
 */

import { useEffect } from 'react';

// ── Inline keyframe style injected once ─────────────────────────────────────
const STYLE_ID = 'bubble-cursor-keyframes';

const CSS = `
@keyframes bubble-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.75;
  }
  60% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-38px) scale(0.15);
    opacity: 0;
  }
}

.cursor-bubble {
  position: fixed;
  pointer-events: none;
  border-radius: 50%;
  animation: bubble-float 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity;
  z-index: 99999;
}
`;

// ── Bubble colours (champagne-water palette) ─────────────────────────────────
const PALETTES = [
  // light champagne highlight
  'radial-gradient(circle at 35% 32%, rgba(255,248,220,0.95) 0%, rgba(197,168,128,0.45) 40%, rgba(180,148,100,0.12) 75%, transparent 100%)',
  // soft blue-water tint
  'radial-gradient(circle at 38% 30%, rgba(220,240,255,0.9) 0%, rgba(150,200,240,0.38) 42%, rgba(100,170,220,0.10) 78%, transparent 100%)',
  // silver-white
  'radial-gradient(circle at 33% 28%, rgba(255,255,255,0.92) 0%, rgba(210,215,225,0.42) 44%, rgba(180,190,210,0.10) 80%, transparent 100%)',
];

// ── Helper ───────────────────────────────────────────────────────────────────
function spawnBubble(x: number, y: number) {
  const size = 10 + Math.random() * 14; // 10 – 24 px
  const el = document.createElement('div');
  el.className = 'cursor-bubble';

  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const duration = 520 + Math.random() * 180; // 520 – 700 ms
  const wobble = (Math.random() - 0.5) * 18; // slight horizontal drift

  Object.assign(el.style, {
    width: `${size}px`,
    height: `${size}px`,
    // Centre the bubble on cursor
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    background: palette,
    // Rim highlight
    boxShadow: `inset -2px -2px 4px rgba(255,255,255,0.55), inset 1px 1px 6px rgba(255,255,255,0.25), 0 0 6px rgba(197,168,128,0.18)`,
    animationDuration: `${duration}ms`,
    // Random upward angle
    '--wobble': `${wobble}px`,
  } as CSSStyleDeclaration & Record<string, string>);

  // Slight horizontal wobble via a tiny translateX baked into start
  el.style.transform = `translateX(${wobble}px)`;

  document.body.appendChild(el);

  // Clean up after animation finishes (+ small buffer)
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

// ── Component ────────────────────────────────────────────────────────────────
const BubbleCursor: React.FC = () => {
  useEffect(() => {
    // Only on true pointer (mouse/trackpad) devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // Inject keyframes once
    if (!document.getElementById(STYLE_ID)) {
      const styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);
    }

    let lastX = -999;
    let lastY = -999;
    const MIN_DIST = 6; // px – minimum travel before next bubble

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MIN_DIST) return;

      lastX = e.clientX;
      lastY = e.clientY;
      spawnBubble(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // No DOM output from React — all elements created imperatively
  return null;
};

export default BubbleCursor;
