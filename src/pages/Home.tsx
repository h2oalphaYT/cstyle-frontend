import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, Award, Shield, Star, Quote, Copy, Check } from 'lucide-react';
import { categoriesApi, couponsApi, productsApi, type Coupon, type Product, type Review } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { getRecentlyViewedIds } from '../utils/recentlyViewed';
import ProductCard from '../components/ProductCard';
import SafeImage from '../components/SafeImage';
import { ErrorState, ProductGridSkeleton } from '../components/StateViews';
import Hero from '../components/home/Hero';
import { Reveal, useInViewOnce } from '../motion';
import { FREE_SHIPPING_THRESHOLD, HOME_MOBILE_PRODUCT_LIMIT } from '../config/store';

/** Section rhythm shared by every home section. */
const SECTION = 'py-16 md:py-24 relative';

const SectionTitle = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) => (
  <Reveal className="text-center mb-10 md:mb-14">
    <p className="cs-eyebrow mb-4">{eyebrow}</p>
    <h2 className="text-2xl md:text-4xl text-cs-text mb-4">{title}</h2>
    <div className="h-px w-12 bg-cs-accent mx-auto" />
    {subtitle && <p className="text-cs-muted text-sm tracking-wide mt-4">{subtitle}</p>}
  </Reveal>
);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useTheme();

  // ── Live catalog data ─────────────────────────────────────────────
  const featured = useApi(() => productsApi.list({ featured: true, limit: 8, sort: 'best-selling' }), []);
  const arrivals = useApi(() => productsApi.list({ newArrival: true, limit: 4, sort: 'newest' }), []);
  const sale = useApi(() => productsApi.list({ onSale: true, limit: 4, sort: 'price-asc' }), []);
  const { data: categories } = useApi(() => categoriesApi.list(), []);
  const { data: coupons } = useApi(() => couponsApi.publicList(), []);
  const recentIds = getRecentlyViewedIds();
  const recent = useApi(
    () => (isAuthenticated ? productsApi.recentlyViewed() : productsApi.list({ ids: recentIds.join(','), limit: 12 })),
    [isAuthenticated],
    isAuthenticated || recentIds.length > 0,
  );

  return (
    <div className="bg-cs-bg">
      {/* One default banner with the real garment photos (admin hero banners aren't used). */}
      <Hero />

      {/* THE CSTYLE DIFFERENCE */}
      <section className={`${SECTION} bg-cs-bg`}>
        <div className="luxury-container">
          <SectionTitle eyebrow="Why Choose Us" title="The CStyle Difference" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-cs-border border border-cs-border">
            {[
              { Icon: Truck, title: 'Free Shipping', desc: `On orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
              { Icon: RefreshCw, title: 'Easy Returns', desc: '30-day money back' },
              { Icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { Icon: Award, title: 'Premium Quality', desc: 'Crafted to perfection' },
            ].map((feature, i) => (
              <Reveal key={feature.title} index={i} className="group p-5 md:p-10 bg-cs-bg hover:bg-cs-surface transition-colors duration-base text-center">
                <div className="w-10 h-10 mx-auto mb-4 md:mb-6 flex items-center justify-center border border-cs-accent/30 group-hover:border-cs-accent transition-colors duration-base">
                  <feature.Icon className="w-4 h-4 text-cs-accent" aria-hidden />
                </div>
                <h3 className="text-[11px] md:text-sm text-cs-text mb-2 !tracking-[0.18em]">{feature.title}</h3>
                <p className="text-cs-muted text-xs tracking-wide">{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP FOR — Men / Women / Kids */}
      <section className={`${SECTION} bg-cs-surface`}>
        <div className="luxury-container">
          <SectionTitle eyebrow="Collections" title="Shop For" />
          <div className="grid grid-cols-3 gap-1">
            {[
              { name: 'MEN', gender: 'men', image: '/images/hero/polo-black.webp' },
              { name: 'WOMEN', gender: 'women', image: '/images/hero/dress-olive.webp' },
              { name: 'KIDS', gender: 'kids', image: '/images/hero/kids-tee.webp' },
            ].map((group, i) => (
              <Reveal key={group.name} index={i}>
                <Link to={`/shop?gender=${group.gender}`} className="group relative block overflow-hidden aspect-[3/4]">
                  <SafeImage src={group.image} alt={`Shop ${group.name.toLowerCase()}`} width={800} height={1067} wrapperClassName="w-full h-full" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow ease-cs" />
                  <div className="absolute inset-0 bg-gradient-to-t from-cs-bg via-cs-bg/40 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-cs-accent group-hover:w-full transition-all duration-slow ease-cs" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 md:pb-12 px-1 text-center">
                    <h3 className="text-sm sm:text-lg md:text-2xl text-cs-text !tracking-[0.2em] md:!tracking-[0.3em] mb-1 md:mb-2 group-hover:text-cs-accent transition-colors duration-fast">
                      {group.name}
                    </h3>
                    <p className="hidden sm:block text-cs-muted text-xs tracking-[0.2em] uppercase">Shop Now</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ON SALE — live sale products and active coupon codes */}
      {(sale.loading || (sale.data && sale.data.length > 0)) && (
        <section className={`${SECTION} bg-cs-bg border-t border-cs-border`}>
          <div className="luxury-container">
            <SectionTitle eyebrow="Offers" title="On Sale Now" subtitle="Selected styles at reduced prices" />
            {coupons && coupons.length > 0 && <CouponCards coupons={coupons.slice(0, 3)} />}
            <ProductGrid products={sale.data} loading={sale.loading} />
            <ViewAll to="/shop?onSale=true" label="View All Offers" />
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      <ProductSection
        eyebrow="Just Dropped"
        title="New Arrivals"
        subtitle="Fresh styles, refined craftsmanship"
        products={arrivals.data}
        loading={arrivals.loading}
        error={arrivals.error}
        onRetry={arrivals.reload}
        link="/shop?newArrival=true"
        className="bg-cs-surface"
      />

      {/* SHOP BY CATEGORY — categories and images managed in the admin */}
      {categories && categories.length > 0 && (
        <section className={`${SECTION} bg-cs-bg`}>
          <div className="luxury-container">
            <SectionTitle eyebrow="Explore" title="Shop by Category" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-1">
              {categories.map((category, i) => (
                <Reveal key={category.id} index={i}>
                  <Link to={`/shop?category=${category.slug}`} className="group relative block overflow-hidden aspect-[4/5] md:aspect-[3/4]">
                    <SafeImage src={category.image} alt={category.name} width={800} height={1000} wrapperClassName="w-full h-full" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow ease-cs" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cs-bg via-cs-bg/30 to-transparent opacity-85" />
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-cs-accent group-hover:w-full transition-all duration-slow ease-cs" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 md:pb-12 px-2 text-center">
                      <h3 className="text-xs sm:text-base md:text-2xl text-cs-text !tracking-[0.18em] md:!tracking-[0.3em] mb-1 md:mb-2 group-hover:text-cs-accent transition-colors duration-fast">
                        {category.name}
                      </h3>
                      <p className="text-cs-muted text-[10px] md:text-xs tracking-[0.2em] uppercase">
                        {category.productCount} Item{category.productCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED COLLECTION */}
      <ProductSection
        eyebrow="Curated Picks"
        title="Featured Collection"
        subtitle="Handpicked premium pieces"
        products={featured.data}
        loading={featured.loading}
        error={featured.error}
        onRetry={featured.reload}
        link="/shop?featured=true"
        className="bg-cs-surface"
      />

      {/* RECENTLY VIEWED */}
      {recent.data && recent.data.length > 0 && (
        <ProductSection
          eyebrow="Pick Up Where You Left Off"
          title="Recently Viewed"
          products={recent.data.slice(0, 4)}
          loading={false}
          className="bg-cs-bg"
        />
      )}

      {/* TESTIMONIALS — real reviews only; hidden when there are none */}
      <Testimonials />

      {/* FINAL CTA */}
      <section className={`${SECTION} bg-cs-surface overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-full h-[600px] bg-cs-accent/5 rounded-full blur-3xl" />
        </div>
        <Reveal className="luxury-container relative z-10 text-center">
          <p className="cs-eyebrow !tracking-[0.35em] mb-6">Ready?</p>
          <h2 className="text-cs-text mb-6 leading-tight !tracking-[0.12em]" style={{ fontSize: 'clamp(1.75rem, 6vw, 4.5rem)' }}>
            Elevate Your Style
          </h2>
          <p className="text-cs-muted text-sm tracking-wide mb-10 max-w-md mx-auto">
            Join thousands of satisfied customers and experience premium fashion made in Sri Lanka.
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-brand-canvas text-brand-black px-10 py-4 text-xs font-medium uppercase tracking-[0.22em] hover:bg-cs-bg hover:text-cs-text border border-transparent hover:border-cs-text rounded-cs transition-colors duration-base group"
            >
              Shop Now
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-fast" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-3 border border-cs-border-strong text-cs-text px-10 py-4 text-xs font-medium uppercase tracking-[0.22em] hover:border-cs-accent hover:text-cs-accent rounded-cs transition-colors duration-base"
            >
              Our Story
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

// ── Pieces ──────────────────────────────────────────────────────────────

/** 2 columns on phones (max 4 cards, then "View all"), 4 on desktop. */
const ProductGrid = ({ products, loading }: { products?: Product[]; loading: boolean }) => (
  loading && !products ? (
    <ProductGridSkeleton count={4} className="grid-cols-2 lg:grid-cols-4 !gap-3 md:!gap-6" />
  ) : (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 items-stretch">
      {(products || []).map((product, i) => (
        <Reveal key={product.id} index={i % 4} className={`h-full ${i >= HOME_MOBILE_PRODUCT_LIMIT ? 'hidden lg:block' : ''}`}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  )
);

const ViewAll = ({ to, label = 'View All' }: { to: string; label?: string }) => (
  <div className="text-center mt-10 md:mt-14">
    <Link
      to={to}
      className="inline-flex items-center gap-3 border border-cs-accent/50 text-cs-accent px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-cs-accent hover:text-brand-black transition-colors duration-base"
    >
      {label}
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);

interface ProductSectionProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products?: Product[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  link?: string;
  className?: string;
}

const ProductSection = ({ eyebrow, title, subtitle, products, loading, error, onRetry, link, className = '' }: ProductSectionProps) => {
  if (!loading && !error && !products?.length) return null;
  return (
    <section className={`${SECTION} ${className}`}>
      <div className="luxury-container">
        <SectionTitle eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {error ? <ErrorState message={error} onRetry={onRetry} /> : <ProductGrid products={products} loading={loading} />}
        {link && !error && <ViewAll to={link} />}
      </div>
    </section>
  );
};

/** Coupon codes as equal cards: 1 column on phones, 3 across on desktop; tap to copy. */
const CouponCards = ({ coupons }: { coupons: Coupon[] }) => {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(code);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-14 max-w-4xl mx-auto">
      {coupons.map((c, i) => {
        const isCopied = copied === c.code;
        return (
          <Reveal key={c.code} index={i} className="h-full">
            <button
              onClick={() => copy(c.code)}
              className={`w-full h-full min-h-[96px] flex items-center justify-between gap-4 text-left px-5 py-4 bg-cs-surface border border-dashed transition-colors duration-fast ${isCopied ? 'border-cs-accent' : 'border-cs-accent/35 hover:border-cs-accent/70'}`}
              aria-label={isCopied ? `${c.code} copied` : `Copy coupon code ${c.code}`}
            >
              <span className="min-w-0">
                <span className="block font-poppins text-lg font-light text-cs-text tracking-[0.2em]">{c.code}</span>
                <span className="block text-[11px] text-cs-muted uppercase tracking-[0.12em] mt-1 line-clamp-2">{c.description}</span>
              </span>
              <span className={`flex-shrink-0 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] ${isCopied ? 'text-cs-accent' : 'text-cs-muted'}`} aria-live="polite">
                {isCopied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </span>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
};

type Testimonial = Review & { productName: string };

/**
 * Pulls real customer reviews (4★ and up, with a comment) from the best-rated products.
 * Loads only when the section approaches the viewport and renders nothing if there are none.
 */
const Testimonials = () => {
  const [sentinel, near] = useInViewOnce<HTMLDivElement>();
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    if (!near) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data: rated } = await productsApi.list({ sort: 'rating', limit: 6 });
        const withReviews = rated.filter(p => p.ratingCount > 0).slice(0, 4);
        const pages = await Promise.all(withReviews.map(p =>
          productsApi.reviews(p.id).then(r => r.data.map(rv => ({ ...rv, productName: p.name }))).catch(() => [] as Testimonial[])));
        const picked = pages.flat()
          .filter(r => r.rating >= 4 && r.comment?.trim())
          .sort((a, b) => b.rating - a.rating || +new Date(b.createdAt) - +new Date(a.createdAt))
          .slice(0, 3);
        if (!cancelled) setItems(picked);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, [near]);

  if (!items?.length) return <div ref={sentinel} aria-hidden className="h-px" />;

  return (
    <section className={`${SECTION} bg-cs-bg`}>
      <div className="luxury-container">
        <SectionTitle eyebrow="Testimonials" title="Customer Reviews" subtitle="What our customers say" />
        <div className={`grid grid-cols-1 ${items.length === 2 ? 'md:grid-cols-2' : items.length >= 3 ? 'md:grid-cols-3' : ''} gap-px bg-cs-border border border-cs-border`}>
          {items.map((t, i) => (
            <Reveal key={t.id} index={i} className="p-6 md:p-10 bg-cs-bg">
              <div className="flex gap-1 mb-5" role="img" aria-label={`${t.rating} out of 5 stars`}>
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s < t.rating ? 'text-cs-accent fill-current' : 'text-white/20'}`} aria-hidden />
                ))}
              </div>
              <Quote className="w-6 h-6 text-cs-accent/40 mb-4" aria-hidden />
              {t.title && <p className="text-cs-text text-sm mb-2">{t.title}</p>}
              <p className="text-cs-muted text-sm mb-8 leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
              <div className="border-t border-cs-border pt-5">
                <p className="text-cs-text text-sm uppercase tracking-[0.15em]">{t.name}</p>
                <p className="text-cs-accent text-[10px] uppercase tracking-[0.2em] mt-1">
                  {t.verifiedPurchase ? 'Verified purchase · ' : ''}{t.productName}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
