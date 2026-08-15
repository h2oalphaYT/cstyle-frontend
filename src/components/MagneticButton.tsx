/**
 * MagneticButton
 * Wraps any children and gives them a magnetic pull toward the cursor.
 * Springs to origin on mouse leave. Disabled on touch devices.
 */
import { useRef, useState, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum pull distance in px (default 12) */
  maxDistance?: number;
  /** Spring stiffness (default 150) */
  stiffness?: number;
  /** Spring damping (default 15) */
  damping?: number;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  maxDistance = 12,
  stiffness = 150,
  damping = 15,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const springCfg = { stiffness, damping, mass: 0.2 };
  const x = useSpring(0, springCfg);
  const y = useSpring(0, springCfg);

  // Disable on touch-only devices
  const canHover =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canHover || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Clamp pull to maxDistance
      const clamp = (v: number) =>
        Math.max(-maxDistance, Math.min(maxDistance, v * 0.35));
      x.set(clamp(dx));
      y.set(clamp(dy));
    },
    [canHover, maxDistance, x, y]
  );

  const handleMouseEnter = () => setIsHovering(true);

  const handleMouseLeave = () => {
    setIsHovering(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      data-hovering={isHovering}
    >
      {children}
    </motion.div>
  );
};

export default MagneticButton;
