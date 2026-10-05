import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid2x2 as Grid, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoriesApi, productsApi, type Category } from '../api';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/StateViews';
import { useApi } from '../hooks/useApi';

const PAGE_SIZE = 12;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '4Y', '6Y', '8Y', '10Y', '12Y'];
const COLORS = ['White', 'Black', 'Navy', 'Sand', 'Olive', 'Charcoal', 'Grey', 'Khaki', 'Sky Blue', 'Light Blue', 'Beige', 'Sage', 'Terracotta', 'Cream', 'Brown', 'Pink', 'Red'];
const FILTER_KEYS = ['category', 'gender', 'minPrice', 'maxPrice', 'size', 'color', 'sort', 'onSale', 'featured', 'newArrival', 'inStock'] as const;

const selectClass = 'w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs tracking-wide focus:outline-none transition-colors cursor-pointer appearance-none';
const labelClass = 'block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);

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

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Page Header */}
      <div className="border-b border-white/6">
        <div className="luxury-container py-16 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="text-brand-champagne uppercase tracking-[0.35em] text-xs mb-4">
              {searchQuery ? 'Search Results' : 'Collection'}
            </p>
            <h1
              className="font-light text-white uppercase tracking-[0.15em] mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300 }}
            >
              {heading}
            </h1>
            <div className="h-px w-10 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-xs tracking-[0.2em] uppercase">
              {loading && !products ? 'Loading…' : `${total} Product${total !== 1 ? 's' : ''} Available`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="luxury-container py-12">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-5 mb-10 pb-6 border-b border-white/6">
          <div className="flex items-center gap-4">
            <div className="flex border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors duration-300 ${viewMode === 'grid' ? 'bg-brand-champagne text-brand-black' : 'text-brand-muted hover:text-white'}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 border-l border-white/10 transition-colors duration-300 ${viewMode === 'list' ? 'bg-brand-champagne text-brand-black' : 'text-brand-muted hover:text-white'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-xs uppercase tracking-[0.18em] font-medium border transition-colors duration-300 ${
                showFilters ? 'border-brand-champagne text-brand-champagne' : 'border-white/20 text-brand-muted hover:border-brand-champagne/50 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {showFilters ? 'Hide' : 'Filter'}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          <select
            value={get('sort') || (searchQuery ? 'best-selling' : 'newest')}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="px-5 py-2.5 bg-transparent border border-white/15 text-brand-muted text-xs uppercase tracking-[0.12em] focus:outline-none focus:border-brand-champagne/50 transition-colors cursor-pointer appearance-none hover:border-white/30"
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
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="lg:w-72 flex-shrink-0 overflow-hidden"
              >
                <div className="bg-brand-surface border border-white/8 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-brand-champagne uppercase tracking-[0.25em] text-[9px] mb-1">Refine</p>
                      <h3 className="text-sm font-light text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                      </h3>
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-brand-muted hover:text-brand-champagne uppercase tracking-[0.15em] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  </div>

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
                          className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/20 focus:outline-none transition-colors"
                        />
                        <input
                          type="number" min={0} placeholder="Max" aria-label="Maximum price"
                          value={priceDraft.max}
                          onChange={(e) => setPriceDraft(p => ({ ...p, max: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/20 focus:outline-none transition-colors"
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

                    <div className="space-y-3">
                      {([
                        ['onSale', 'On Sale'],
                        ['newArrival', 'New Arrivals'],
                        ['featured', 'Featured'],
                        ['inStock', 'In Stock Only'],
                      ] as const).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 text-xs text-brand-muted uppercase tracking-[0.15em] cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={get(key) === 'true'}
                            onChange={(e) => updateParams({ [key]: e.target.checked ? 'true' : '' })}
                            className="accent-[#C5A880]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : loading && !products ? (
              <ProductGridSkeleton count={6} className={viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} />
            ) : !products?.length ? (
              <EmptyState
                title="No Products Found"
                message={searchQuery ? `Nothing matched "${searchQuery}". Try another word or remove some filters.` : 'Try adjusting your filters.'}
                action={(
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 border border-brand-champagne/40 text-brand-champagne px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] hover:bg-brand-champagne hover:text-brand-black transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
                )}
              />
            ) : (
              <>
                <div className={`grid gap-6 transition-opacity ${loading ? 'opacity-50' : ''} ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-14" aria-label="Pagination">
                    <button
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                      className="p-2.5 border border-white/15 text-brand-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && p - arr[i - 1] > 1 && <span className="text-brand-muted px-1">…</span>}
                          <button
                            onClick={() => goToPage(p)}
                            aria-current={p === page ? 'page' : undefined}
                            className={`min-w-[40px] py-2 text-xs border transition-colors ${p === page ? 'border-brand-champagne bg-brand-champagne text-brand-black' : 'border-white/15 text-brand-muted hover:text-white'}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                      className="p-2.5 border border-white/15 text-brand-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default Shop;
