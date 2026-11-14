# Storefront polish and motion (Nov 2026)

## Where things live
- **Design tokens:** `src/index.css` (`:root --cs-*`), exposed to Tailwind as `cs-*` classes
  (`bg-cs-bg`, `text-cs-muted`, `text-cs-accent`, `duration-base`, `ease-cs`…) in `tailwind.config.js`,
  and mirrored for JS motion in `src/design/tokens.ts`.
- **Store constants:** `src/config/store.ts`: free-shipping threshold (Rs 30,000), business address,
  phone, email, opening hours, contact hero image path.
- **Motion:** `src/motion/index.tsx` (`Reveal`, `CountUp`, reduced-motion helpers); card tilt CSS in
  `index.css` (`.cs-tilt`); hero in `src/components/home/Hero.tsx`.
- **3D viewer:** `src/components/product/GarmentViewer.tsx` (three.js, its own chunk, loaded only when
  a shopper presses "3D" on a product page; offered only on devices with WebGL and 4+ cores / 4GB+).

## Things the owner needs to supply
1. **Contact hero photo:** replace `public/images/contact/contact-hero-REPLACE-ME.webp`
   (about 1600×900, WebP), or change `CONTACT_HERO_IMAGE` in `src/config/store.ts`.
2. **Phone number:** set `CONTACT.phone` in `src/config/store.ts`. Until then no phone number is
   shown (the old one was a placeholder).

## Notes
- Every animation respects `prefers-reduced-motion`.
- The storefront is dark in both themes; the light/dark toggle restyles the admin.
- Pages other than Home are lazy-loaded to keep the first download small.

## Landing video and product photos (Nov 2026)
- **Home hero:** one default banner over a background video that follows the theme toggle (dark: `landing*`, light: `landing-colour*`) (admin hero banners are not shown).
  Files live on the API server in `cstyle-backend/media/` (served at `/media/`) (`landing.mp4` 1080p, `landing-960.mp4`
  for phones, `landing-poster.webp`) and are fetched from there; paths are in `LANDING_VIDEO` in
  `src/config/store.ts` (use full URLs there to host them on R2 instead). Reduced motion or data saver
  shows the poster only.
- **Product photos:** `cstyle-backend/scripts/set-product-photos.js` (`npm run products:photos`, dry run;
  `-- --yes` to apply) sets the photos in `scripts/product-photos/` as product images by SKU.
