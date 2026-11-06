import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Search, Filter, SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'All',
  'Electronics',
  'Fashion & Clothing',
  'Mobile Phones',
  'Laptops & Computers',
  'Shoes & Footwear',
  'Grocery & Daily Essentials',
  'Home & Kitchen',
  'Furniture',
  'Beauty & Personal Care',
  'Sports & Fitness',
  'Books & Stationery',
  'Toys & Baby Products',
  'Watches & Accessories',
  'Automotive Accessories'
];

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with search params changes
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategory(urlCategory);

    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearch(urlSearch);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [category, minPrice, maxPrice, rating, inStock, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;
      if (inStock) params.inStock = 'true';
      if (sort) params.sort = sort;

      const res = await api.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.warn('Error loading products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setInStock(false);
    setSort('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineering Catalog & Hardware Store
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time synced catalog running on AWS EKS with Prometheus telemetry
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>

            {/* Total Results */}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Showing <strong className="text-slate-900 dark:text-white">{products.length}</strong> of {totalCount} items
            </span>

            {/* Sorting Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>

            {/* Reset Filter Button */}
            <button
              onClick={resetFilters}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Categories
                </h3>
                <div className="space-y-1">
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        category === cat
                          ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{cat}</span>
                      {category === cat && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Price Range ($)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Minimum Rating
                </h3>
                <div className="space-y-1 text-xs">
                  {[4.5, 4.0, 3.5].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <input
                        type="radio"
                        name="rating"
                        checked={rating === String(stars)}
                        onChange={() => setRating(String(stars))}
                        className="rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>{stars} Stars & Above</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In-Stock Toggle */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-2xl bg-white dark:bg-slate-900 p-4 h-80 animate-pulse border border-slate-200 dark:border-slate-800" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-base font-bold text-slate-900 dark:text-white">No products found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-white shadow"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

