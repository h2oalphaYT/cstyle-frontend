import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Grid2x2 as Grid, List, X, Sparkles, TrendingUp } from 'lucide-react';
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(product => product.subcategory === filters.subcategory);
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter(product => product.sizes.includes(filters.size));
    }

    // Color filter
    if (filters.color) {
      filtered = filtered.filter(product =>
        product.colors.some(color =>
          color.toLowerCase().includes(filters.color.toLowerCase())
        )
      );
    }

    // Sort
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
    <div className="min-h-screen bg-black py-12">
      <div className="luxury-container">
        {/* EXPLOSIVE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                {searchQuery ? `SEARCH: "${searchQuery}"` : 'PREMIUM COLLECTION'}
              </span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6" />
            <div className="flex items-center justify-center gap-4 text-gray-400">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <p className="text-xl font-bold uppercase tracking-wider">
                {filteredProducts.length} Premium Product{filteredProducts.length !== 1 ? 's' : ''} Available
              </p>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
          </div>

          {/* CONTROLS BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-gray-900 to-black border-2 border-gray-800 p-6">
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex border-2 border-yellow-400 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 group"
              >
                <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-6 py-3 bg-black border-2 border-yellow-400 text-yellow-400 font-bold uppercase tracking-wider focus:outline-none focus:shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all cursor-pointer"
            >
              <option value="name">Sort: A-Z</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Top Rated ⭐</option>
              <option value="newest">New Arrivals 🔥</option>
            </select>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* EXPLOSIVE FILTERS SIDEBAR */}
          <motion.div
            initial={false}
            animate={{
              width: showFilters ? '320px' : '0px',
              opacity: showFilters ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className={`${showFilters ? 'block' : 'hidden lg:block'} lg:w-80 space-y-6`}
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-400 p-8 relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-6 h-6" />
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-yellow-400 font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-black text-white mb-3 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-yellow-400 font-bold focus:border-yellow-400 focus:outline-none transition-all"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  {availableSubcategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-black text-white mb-3 uppercase tracking-wider">
                        Subcategory
                      </label>
                      <select
                        value={filters.subcategory}
                        onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                        className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-yellow-400 font-bold focus:border-yellow-400 focus:outline-none transition-all"
                      >
                        <option value="">All Subcategories</option>
                        {availableSubcategories.map(subcategory => (
                          <option key={subcategory} value={subcategory}>
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-black text-white mb-3 uppercase tracking-wider">
                      Price Range (LKR)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full sm:flex-1 px-4 py-3 bg-black border-2 border-gray-700 text-yellow-400 font-bold placeholder-gray-600 focus:border-yellow-400 focus:outline-none transition-all"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full sm:flex-1 px-4 py-3 bg-black border-2 border-gray-700 text-yellow-400 font-bold placeholder-gray-600 focus:border-yellow-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Size Filter */}
                  <div>
                    <label className="block text-sm font-black text-white mb-3 uppercase tracking-wider">
                      Size
                    </label>
                    <select
                      value={filters.size}
                      onChange={(e) => handleFilterChange('size', e.target.value)}
                      className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-yellow-400 font-bold focus:border-yellow-400 focus:outline-none transition-all"
                    >
                      <option value="">All Sizes</option>
                      {allSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <label className="block text-sm font-black text-white mb-3 uppercase tracking-wider">
                      Color
                    </label>
                    <select
                      value={filters.color}
                      onChange={(e) => handleFilterChange('color', e.target.value)}
                      className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-yellow-400 font-bold focus:border-yellow-400 focus:outline-none transition-all"
                    >
                      <option value="">All Colors</option>
                      {allColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/10 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* EXPLOSIVE PRODUCTS GRID */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-400 p-16 text-center"
              >
                <div className="text-yellow-400 text-6xl mb-6">⚠️</div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase">No Products Found</h3>
                <p className="text-xl text-gray-400 mb-8 font-medium">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-10 py-4 text-lg font-black uppercase tracking-wider hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] transition-all"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <div className={`grid gap-8 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
                }`}>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;