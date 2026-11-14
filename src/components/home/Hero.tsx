import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { prefersReducedMotion } from '../../motion';
import { duration, ease } from '../../design/tokens';
import { LANDING_VIDEO } from '../../config/store';
import { resolveImageUrl } from '../../utils/image';
import { useTheme } from '../../context/ThemeContext';
import MagneticButton from '../MagneticButton';

/**
 * The home hero: one default banner over the landing video (admin hero banners are not shown here).
 * The video follows the theme toggle (dark: moody atelier, light: colourful rails) and is fetched
 * from the API server (see LANDING_VIDEO in config/store.ts). Phones get a
 * smaller file; with reduced motion or data saver on, only the still poster frame is shown.
 */
const BANNER = {
  eyebrow: 'Made in Sri Lanka',
  title: 'Elite Fashion',
  cta: 'Explore Collection',
  link: '/shop',
};

const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(c?.saveData);
};

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme } = useTheme();
  const media = LANDING_VIDEO[theme === 'light' ? 'light' : 'dark'];
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const poster = resolveImageUrl(media.poster);

  // Pick the file after mount (and when the theme changes) so phones never download the large one.
  useEffect(() => {
    setPlaying(false);
    if (prefersReducedMotion() || saveData()) return;
    setVideoSrc(resolveImageUrl(window.innerWidth < 768 ? media.small : media.large));
  }, [media]);

  // Some browsers ignore autoPlay until play() is called; a refusal just leaves the poster showing.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc) return;
    v.muted = true;
    v.play().catch(() => undefined);
  }, [videoSrc]);

  return (
    <section
      className="relative overflow-hidden bg-cs-bg h-[calc(100svh-var(--cs-header-h)-36px)] min-h-[480px] max-h-[900px]"
      aria-label="CStyle collection"
    >
      {/* Background: poster frame, then the video fades in once it is playing */}
      <div className="absolute inset-0" aria-hidden>
        <img
          key={poster}
          src={poster}
          alt=""
          width={1600}
          height={900}
          {...{ fetchpriority: "high" }}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            onPlaying={() => setPlaying(true)}
            onError={() => setVideoSrc(null)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-slow ${playing ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>

      {/* Readability: top/bottom fade plus a soft dark pool behind the text */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-cs-bg/50 via-transparent to-cs-bg" aria-hidden />
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 52%, rgba(18,18,18,0.7) 0%, rgba(18,18,18,0.35) 55%, rgba(18,18,18,0) 85%)' }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <motion.div
          className="text-center px-5 max-w-4xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease, delay: 0.2 }}
        >
          <div className="h-px w-12 bg-cs-accent mx-auto mb-8" />
          <p className="text-cs-accent uppercase tracking-[0.35em] text-xs mb-5 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">
            {BANNER.eyebrow}
          </p>
          <h1
            className="!font-light text-cs-text mb-8 leading-[1.05] !tracking-[0.12em] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]"
            style={{ fontSize: 'clamp(2.25rem, 8vw, 6.5rem)' }}
          >
            {BANNER.title}
          </h1>
          <MagneticButton maxDistance={14} stiffness={150} damping={15}>
            <Link
              to={BANNER.link}
              className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-8 sm:px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] rounded-cs hover:bg-cs-bg hover:text-cs-text border border-transparent hover:border-cs-text transition-colors duration-base group"
            >
              {BANNER.cta}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-fast" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
