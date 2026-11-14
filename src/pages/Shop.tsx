import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid2x2 as Grid, List, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Reveal } from '../motion';
import { duration, ease } from '../design/tokens';
import { categoriesApi, productsApi, type Category } from '../api';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/StateViews';
import { useApi } from '../hooks/useApi';

const PAGE_SIZE = 12;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '4Y', '6Y', '8Y', '10Y', '12Y'];
const COLORS = ['White', 'Black', 'Navy', 'Sand', 'Olive', 'Charcoal', 'Grey', 'Khaki', 'Sky Blue', 'Light Blue', 'Beige', 'Sage', 'Terracotta', 'Cream', 'Brown', 'Pink', 'Red'];
const FILTER_KEYS = ['category', 'gender', 'minPrice', 'maxPrice', 'size', 'color', 'sort', 'onSale', 'featured', 'newArrival', 'inStock'] as const;

const selectClass = 'w-full px-3 py-3 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs tracking-wide focus:outline-none transition-colors cursor-pointer appearance-none';
const labelClass = 'block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setIsDesktop(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  // The mobile bottom sheet locks page scroll and closes with Escape.
  const sheetOpen = showFilters && !isDesktop;
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowFilters(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [sheetOpen]);

  const searchQuery = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const get = (key: string) => searchParams.get(key) || '';

  // Price inputs are applied after typing stops instead of on every keystroke.
  const [priceDraft, setPriceDraft] = useState({ min: get('minPrice'), max: get('maxPrice') });

  useEffect(() => {
    categoriesApi.list().then(res => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  const query = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
    category: get('category') || undefined,
    gender: get('gender') || undefined,
    minPrice: get('minPrice') || undefined,
    maxPrice: get('maxPrice') || undefined,
    size: get('size') || undefined,
    color: get('color') || undefined,
    sort: get('sort') || (searchQuery ? 'best-selling' : 'newest'),
    onSale: get('onSale') === 'true' || undefined,
    featured: get('featured') === 'true' || undefined,
    newArrival: get('newArrival') === 'true' || undefined,
    inStock: get('inStock') === 'true' || undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [searchParams]);

  const { data: products, pagination, loading, error, reload } = useApi(
    (signal) => productsApi.list(query, signal),
    [query],
  );

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (priceDraft.min !== get('minPrice') || priceDraft.max !== get('maxPrice')) {
        updateParams({ minPrice: priceDraft.min, maxPrice: priceDraft.max });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceDraft]);

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (searchQuery) next.set('search', searchQuery);
    setPriceDraft({ min: '', max: '' });
    setSearchParams(next);
  };

  const activeFilterCount = FILTER_KEYS.filter(k => k !== 'sort' && searchParams.get(k)).length;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const activeCategory = categories.find(c => c.slug === get('category') || c.name.toLowerCase() === get('category').toLowerCase());

  const goToPage = (p: number) => {
    updateParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heading = searchQuery
    ? `"${searchQuery}"`
    : activeCategory?.name
      || (get('onSale') ? 'Sale' : get('newArrival') ? 'New Arrivals' : get('gender') ? `${get('gender')}` : 'Premium Collection');

  const sortSelect = (
    <div className="relative flex-1 lg:flex-none min-w-0">
      <select
        value={get('sort') || (searchQuery ? 'best-selling' : 'newest')}
        onChange={(e) => updateParams({ sort: e.target.value })}
        className="w-full lg:w-auto h-11 pl-4 pr-9 bg-transparent border border-cs-border-strong text-cs-text text-xs uppercase tracking-[0.12em] focus:outline-none focus:border-cs-accent transition-colors cursor-pointer appearance-none hover:border-white/30"
        aria-label="Sort products"
      >
        <option value="newest" className="bg-brand-black">New Arrivals</option>
        <option value="best-selling" className="bg-brand-black">Best Selling</option>
        <option value="popular" className="bg-brand-black">Most Viewed</option>
        <option value="price-asc" className="bg-brand-black">Price: Low → High</option>
        <option value="price-desc" className="bg-brand-black">Price: High → Low</option>
        <option value="rating" className="bg-brand-black">Top Rated</option>
        <option value="name" className="bg-brand-black">Name: A–Z</option>
      </select>
      <ChevronDown className="w-4 h-4 text-cs-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
    </div>
  );

  const filterFields = (
    <div className="space-y-7">
      <div>
        <label className={labelClass} htmlFor="f-category">Category</label>
        <select id="f-category" value={activeCategory?.slug || ''} onChange={(e) => updateParams({ category: e.target.value })} className={selectClass}>
          <option value="" className="bg-brand-black">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug} className="bg-brand-black">{c.name} ({c.productCount})</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="f-gender">Shop For</label>
        <select id="f-gender" value={get('gender')} onChange={(e) => updateParams({ gender: e.target.value })} className={selectClass}>
          <option value="" className="bg-brand-black">Everyone</option>
          <option value="men" className="bg-brand-black">Men</option>
          <option value="women" className="bg-brand-black">Women</option>
          <option value="kids" className="bg-brand-black">Kids</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Price Range (LKR)</label>
        <div className="flex gap-3">
          <input
            type="number" min={0} placeholder="Min" aria-label="Minimum price"
            value={priceDraft.min}
            onChange={(e) => setPriceDraft(p => ({ ...p, min: e.target.value }))}
            className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/40 focus:outline-none transition-colors"
          />
          <input
            type="number" min={0} placeholder="Max" aria-label="Maximum price"
            value={priceDraft.max}
            onChange={(e) => setPriceDraft(p => ({ ...p, max: e.target.value }))}
            className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="f-size">Size</label>
        <select id="f-size" value={get('size')} onChange={(e) => updateParams({ size: e.target.value })} className={selectClass}>
          <option value="" className="bg-brand-black">All Sizes</option>
          {SIZES.map(size => <option key={size} value={size} className="bg-brand-black">{size}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="f-color">Colour</label>
        <select id="f-color" value={get('color')} onChange={(e) => updateParams({ color: e.target.value })} className={selectClass}>
          <option value="" className="bg-brand-black">All Colours</option>
          {COLORS.map(color => <option key={color} value={color} className="bg-brand-black">{color}</option>)}
        </select>
      </div>

      <div className="space-y-0">
        {([
          ['onSale', 'On Sale'],
          ['newArrival', 'New Arrivals'],
          ['featured', 'Featured'],
          ['inStock', 'In Stock Only'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 min-h-[44px] text-xs text-brand-muted uppercase tracking-[0.15em] cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={get(key) === 'true'}
              onChange={(e) => updateParams({ [key]: e.target.checked ? 'true' : '' })}
              className="accent-[#C5A880] w-4 h-4"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );

  const filterHeader = (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-cs-accent uppercase tracking-[0.25em] text-[10px] mb-1">Refine</p>
        <h2 className="text-sm text-cs-text !tracking-[0.2em] flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" aria-hidden />
          Filters
        </h2>
      </div>
      <button
        onClick={clearFilters}
        className="min-h-[44px] px-2 text-[11px] text-cs-muted hover:text-cs-accent uppercase tracking-[0.15em] transition-colors flex items-center gap-1"
      >
        <X className="w-3 h-3" />
        Clear
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cs-bg">
      {/* Page header: compact on phones so the first products are above the fold */}
      <div className="border-b border-cs-border">
        <div className="luxury-container py-6 md:py-16 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, ease }}
            className="text-center"
          >
            <p className="cs-eyebrow !tracking-[0.35em] !text-[10px] md:!text-xs mb-2 md:mb-4">
              {searchQuery ? 'Search Results' : 'Collection'}
            </p>
            <h1
              className="text-cs-text mb-2 md:mb-4"
              style={{ fontSize: 'clamp(1.35rem, 5vw, 3.5rem)' }}
            >
              {heading}
            </h1>
            <div className="hidden md:block h-px w-10 bg-cs-accent mx-auto mb-4" />
            <p className="text-cs-muted text-[11px] md:text-xs tracking-[0.2em] uppercase">
              {loading && !products ? 'Loading…' : `${total} Product${total !== 1 ? 's' : ''} Available`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="luxury-container py-5 md:py-12">
        {/* Controls: filter + sort on one row */}
        <div className="flex items-center justify-between gap-3 mb-5 md:mb-10 pb-5 md:pb-6 border-b border-cs-border">
          <div className="flex items-center gap-3 flex-1 lg:flex-none min-w-0">
            <div className="hidden lg:flex border border-cs-border-strong overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-11 h-11 flex items-center justify-center transition-colors duration-fast ${viewMode === 'grid' ? 'bg-cs-accent text-brand-black' : 'text-cs-muted hover:text-cs-text'}`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-11 h-11 flex items-center justify-center border-l border-cs-border-strong transition-colors duration-fast ${viewMode === 'list' ? 'bg-cs-accent text-brand-black' : 'text-cs-muted hover:text-cs-text'}`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="shop-filters"
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 h-11 px-5 text-xs uppercase tracking-[0.18em] font-medium border transition-colors duration-fast whitespace-nowrap ${
                showFilters && isDesktop ? 'border-cs-accent text-cs-accent' : 'border-cs-border-strong text-cs-text hover:border-cs-accent/60'
              }`}
            >
              <Filter className="w-3.5 h-3.5" aria-hidden />
              {showFilters && isDesktop ? 'Hide' : 'Filter'}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          {sortSelect}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop filter sidebar */}
          <AnimatePresence>
            {showFilters && isDesktop && (
              <motion.aside
                id="shop-filters"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: duration.fast, ease }}
                className="lg:w-72 flex-shrink-0"
                aria-label="Filters"
              >
                <div className="bg-cs-surface border border-cs-border p-8 space-y-8 lg:sticky lg:top-[calc(var(--cs-header-h)+16px)]">
                  {filterHeader}
                  {filterFields}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : loading && !products ? (
              <ProductGridSkeleton count={6} className={viewMode === 'grid' ? 'grid-cols-2 xl:grid-cols-3 !gap-3 md:!gap-6' : 'grid-cols-1'} />
            ) : !products?.length ? (
              <EmptyState
                title="No Products Found"
                message={searchQuery ? `Nothing matched "${searchQuery}". Try another word or remove some filters.` : 'Try adjusting your filters.'}
                action={(
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 border border-cs-accent/50 text-cs-accent px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] hover:bg-cs-accent hover:text-brand-black transition-colors duration-fast"
                  >
                    Clear All Filters
                  </button>
                )}
              />
            ) : (
              <>
                <h2 className="sr-only">Products</h2>
                <div className={`grid gap-3 md:gap-6 transition-opacity ${loading ? 'opacity-50' : ''} ${viewMode === 'grid' || !isDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2'}`}>
                  {products.map((product, index) => (
                    <Reveal key={product.id} index={index % 6} className="h-full">
                      <ProductCard product={product} eager={index < 2} />
                    </Reveal>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-1 sm:gap-2 mt-10 md:mt-14 flex-wrap" aria-label="Pagination">
                    <button
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                      className="w-11 h-11 flex items-center justify-center border border-cs-border-strong text-cs-muted hover:text-cs-text disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && p - arr[i - 1] > 1 && <span className="text-cs-muted px-1">…</span>}
                          <button
                            onClick={() => goToPage(p)}
                            aria-current={p === page ? 'page' : undefined}
                            aria-label={`Page ${p}`}
                            className={`min-w-[44px] h-11 text-xs border transition-colors ${p === page ? 'border-cs-accent bg-cs-accent text-brand-black' : 'border-cs-border-strong text-cs-muted hover:text-cs-text'}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                      className="w-11 h-11 flex items-center justify-center border border-cs-border-strong text-cs-muted hover:text-cs-text disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet with a sticky "Show X results" button */}
      {createPortal(
        <AnimatePresence>
          {sheetOpen && (
            <motion.div key="sheet" className="fixed inset-0 z-[75] lg:hidden" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
              <motion.div
                className="absolute inset-0 bg-black/70"
                onClick={() => setShowFilters(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast }}
                aria-hidden
              />
              <motion.div
                id="shop-filters"
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                className="absolute inset-x-0 bottom-0 max-h-[88svh] flex flex-col bg-cs-surface border-t border-cs-border rounded-t-cs-lg"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: duration.base, ease }}
              >
                <div className="flex justify-center pt-2.5" aria-hidden><span className="w-10 h-1 rounded-full bg-white/20" /></div>
                <div className="px-5 pt-2 pb-3 border-b border-cs-border flex items-center gap-2">
                  <div className="flex-1">{filterHeader}</div>
                  <button onClick={() => setShowFilters(false)} className="w-11 h-11 -mr-2 flex items-center justify-center text-cs-muted hover:text-cs-text" aria-label="Close filters">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                  {filterFields}
                </div>
                <div className="sticky bottom-0 px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-cs-surface border-t border-cs-border">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full h-12 bg-brand-canvas text-brand-black text-xs font-medium uppercase tracking-[0.2em]"
                  >
                    {loading ? 'Updating…' : `Show ${total} result${total === 1 ? '' : 's'}`}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default Shop;
