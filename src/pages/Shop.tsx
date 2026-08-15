import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid2x2 as Grid, List, X } from 'lucide-react';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    color: '',
    sortBy: 'name'
  });

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.subcategory) {
      filtered = filtered.filter(product => product.subcategory === filters.subcategory);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    if (filters.size) {
      filtered = filtered.filter(product => product.sizes.includes(filters.size));
    }

    if (filters.color) {
      filtered = filtered.filter(product =>
        product.colors.some(color =>
          color.toLowerCase().includes(filters.color.toLowerCase())
        )
      );
    }

    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  }, [filters, searchQuery]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      sortBy: 'name'
    });
  };

  const availableSubcategories = filters.category
    ? categories.find(cat => cat.name === filters.category)?.subcategories || []
    : [];

  const allSizes = [...new Set(products.flatMap(p => p.sizes))];
  const allColors = [...new Set(products.flatMap(p => p.colors))];

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
              {searchQuery ? `"${searchQuery}"` : 'Premium Collection'}
            </h1>
            <div className="h-px w-10 bg-brand-champagne mx-auto mb-4" />
            <p className="text-brand-muted text-xs tracking-[0.2em] uppercase">
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Available
            </p>
          </motion.div>
        </div>
      </div>

      <div className="luxury-container py-12">
        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col md:flex-row justify-between items-center gap-5 mb-10 pb-6 border-b border-white/6"
        >
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-brand-champagne text-brand-black'
                    : 'text-brand-muted hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 border-l border-white/10 transition-colors duration-300 ${
                  viewMode === 'list'
                    ? 'bg-brand-champagne text-brand-black'
                    : 'text-brand-muted hover:text-white'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-xs uppercase tracking-[0.18em] font-medium border transition-colors duration-300 ${
                showFilters
                  ? 'border-brand-champagne text-brand-champagne'
                  : 'border-white/20 text-brand-muted hover:border-brand-champagne/50 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {showFilters ? 'Hide' : 'Filter'}
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-5 py-2.5 bg-transparent border border-white/15 text-brand-muted text-xs uppercase tracking-[0.12em] focus:outline-none focus:border-brand-champagne/50 transition-colors cursor-pointer appearance-none hover:border-white/30"
          >
            <option value="name" className="bg-brand-black">Sort: A–Z</option>
            <option value="price-low" className="bg-brand-black">Price: Low → High</option>
            <option value="price-high" className="bg-brand-black">Price: High → Low</option>
            <option value="rating" className="bg-brand-black">Top Rated</option>
            <option value="newest" className="bg-brand-black">New Arrivals</option>
          </select>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="lg:w-72 flex-shrink-0 overflow-hidden"
              >
                <div className="bg-brand-surface border border-white/8 p-8">
                  {/* Filter Header */}
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
                    {/* Category */}
                    <div>
                      <label className="block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs tracking-wide focus:outline-none transition-colors cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-brand-black">All Categories</option>
                        {categories.map(category => (
                          <option key={category.name} value={category.name} className="bg-brand-black">
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    {availableSubcategories.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]">
                          Subcategory
                        </label>
                        <select
                          value={filters.subcategory}
                          onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                          className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs tracking-wide focus:outline-none transition-colors cursor-pointer appearance-none"
                        >
                          <option value="" className="bg-brand-black">All</option>
                          {availableSubcategories.map(subcategory => (
                            <option key={subcategory} value={subcategory} className="bg-brand-black">
                              {subcategory}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Price Range */}
                    <div>
                      <label className="block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]">
                        Price Range (LKR)
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/20 focus:outline-none transition-colors"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs placeholder-white/20 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]">
                        Size
                      </label>
                      <select
                        value={filters.size}
                        onChange={(e) => handleFilterChange('size', e.target.value)}
                        className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs tracking-wide focus:outline-none transition-colors cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-brand-black">All Sizes</option>
                        {allSizes.map(size => (
                          <option key={size} value={size} className="bg-brand-black">{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-[10px] font-medium text-brand-muted mb-3 uppercase tracking-[0.2em]">
                        Color
                      </label>
                      <select
                        value={filters.color}
                        onChange={(e) => handleFilterChange('color', e.target.value)}
                        className="w-full px-3 py-2.5 bg-transparent border-b border-white/15 focus:border-brand-champagne text-white text-xs tracking-wide focus:outline-none transition-colors cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-brand-black">All Colors</option>
                        {allColors.map(color => (
                          <option key={color} value={color} className="bg-brand-black">{color}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/8 p-20 text-center bg-brand-surface"
              >
                <p className="text-brand-champagne text-4xl mb-6">—</p>
                <h3 className="text-lg font-light text-white mb-3 uppercase tracking-[0.2em]">No Products Found</h3>
                <p className="text-brand-muted text-sm mb-8 tracking-wide">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 border border-brand-champagne/40 text-brand-champagne px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] hover:bg-brand-champagne hover:text-brand-black transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;