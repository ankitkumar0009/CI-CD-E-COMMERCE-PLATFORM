import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Tv, Smartphone, Laptop, Shirt, Footprints, 
  ShoppingBasket, UtensilsCrossed, Armchair, Sparkles, 
  Dumbbell, BookOpen, Watch, ShoppingBag, Baby, 
  Search, ArrowRight, Grid, Tag, Sparkle
} from 'lucide-react';
import { api } from '../services/api';

const ICON_MAP = {
  Tv, Smartphone, Laptop, Shirt, Footprints,
  ShoppingBasket, UtensilsCrossed, Armchair, Sparkles,
  Dumbbell, BookOpen, Watch, ShoppingBag, Baby
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400">Home</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">All 15 Departments</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <Sparkle className="w-4 h-4" />
                <span>ShopSphere Department Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore All Product Categories
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Browse through 15 meticulously organized marketplace categories, verified Indian suppliers, guaranteed authentic brands, and secure checkout.
              </p>
            </div>

            {/* Search within Categories */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search category or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No departments found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filtered.map((cat, idx) => {
              const IconComp = ICON_MAP[cat.icon] || Tag;
              return (
                <motion.div
                  key={cat.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Category Image Cover */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-md">
                        <IconComp className="w-5 h-5" />
                      </div>

                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">Dept #{idx + 1}</span>
                        <h3 className="font-bold text-base leading-snug drop-shadow">{cat.name}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-4">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center justify-between w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <span>Browse Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

