/**
 * Store-wide constants shown in the storefront. Change them here, not in the pages.
 * The server's /api/config remains the source of truth for checkout maths; this value is
 * what the storefront shows before that call returns (and must match FREE_SHIPPING_THRESHOLD
 * in the backend .env).
 */
export const FREE_SHIPPING_THRESHOLD = 30000;

/** Business details (from the Our Story page). */
export const CONTACT = {
  company: 'CStyle (Pvt) Ltd',
  addressLines: ['New Town, Pitigala', 'Sri Lanka'],
  /**
   * TODO(owner): add the business phone number, e.g. '+94 91 229 1234'.
   * While it is empty the phone line is hidden everywhere instead of showing a fake number.
   */
  phone: '' as string,
  email: 'hello@cstyle.lk',
  hours: ['Mon–Fri: 10AM–8PM', 'Sat: 10AM–6PM', 'Sun: 12PM–5PM'],
} as const;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/**
 * Contact page hero. Replace the file at public/images/contact/contact-hero-REPLACE-ME.webp
 * with a workshop / brand photo (about 1600×900, WebP), or point this path at the new file.
 */
export const CONTACT_HERO_IMAGE = '/images/contact/contact-hero-REPLACE-ME.webp';

/** Products shown per home-page section on phones before "View all". */
export const HOME_MOBILE_PRODUCT_LIMIT = 4;

/**
 * Home landing videos, one per theme (dark: moody atelier, light: colourful rails). The files live
 * on the API server in cstyle-backend/media/ and are fetched from there (relative paths get the API
 * address added). To host them elsewhere, e.g. Cloudflare R2, put full https:// URLs here.
 * large = 1920×1080 for tablets/desktops, small = 960×540 for phones, poster = still frame shown
 * while loading and instead of the video when motion is reduced.
 */
export const LANDING_VIDEO = {
  dark: {
    large: '/media/landing.mp4',
    small: '/media/landing-960.mp4',
    poster: '/media/landing-poster.webp',
  },
  light: {
    large: '/media/landing-colour.mp4',
    small: '/media/landing-colour-960.mp4',
    poster: '/media/landing-colour-poster.webp',
  },
} as const;
