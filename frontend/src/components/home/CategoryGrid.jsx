// ==============================================================================
// SHOPSPHERE - 15 Mandatory Categories Grid
// Displays all 15 categories dynamically with icons, images, and live counts
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tv,
  Shirt,
  Smartphone,
  Laptop,
  Footprints,
  ShoppingBasket,
  UtensilsCrossed,
  Armchair,
  Sparkles,
  Dumbbell,
  BookOpen,
  Baby,
  Watch,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

const ICON_MAP = {
  'Electronics': Tv,
  'Mobile Phones': Smartphone,
  'Laptops': Laptop,
  'Fashion': Shirt,
  'Clothing': Shirt,
  'Shoes': Footprints,
  'Grocery': ShoppingBasket,
  'Home and Kitchen': UtensilsCrossed,
  'Furniture': Armchair,
  'Beauty Products': Sparkles,
  'Sports': Dumbbell,
  'Books': BookOpen,
  'Watches': Watch,
  'Accessories': ShoppingBag,
  'Toys': Baby
};

export const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllCategories()
      .then(res => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {
        setCategories([
          { name: 'Electronics', slug: 'electronics' },
          { name: 'Mobile Phones', slug: 'mobile-phones' },
          { name: 'Laptops', slug: 'laptops' },
          { name: 'Fashion', slug: 'fashion' },
          { name: 'Clothing', slug: 'clothing' },
          { name: 'Shoes', slug: 'shoes' },
          { name: 'Grocery', slug: 'grocery' },
          { name: 'Home and Kitchen', slug: 'home-and-kitchen' },
          { name: 'Furniture', slug: 'furniture' },
          { name: 'Beauty Products', slug: 'beauty-products' },
          { name: 'Sports', slug: 'sports' },
          { name: 'Books', slug: 'books' },
          { name: 'Watches', slug: 'watches' },
          { name: 'Accessories', slug: 'accessories' },
          { name: 'Toys', slug: 'toys' }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-slate-900/60 border-t border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Department Stores
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore All 15 Product Departments
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Shop verified direct sellers with authentic warranties, UPI QR discounts, and instant Razorpay checkout.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Link
              to="/categories"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 transition-colors border border-cyan-200 dark:border-cyan-800"
            >
              Browse Category Directory
            </Link>
            <Link
              to="/shop"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 group"
            >
              All Products
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Categories Grid (Responsive 2 to 5 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {categories.map((cat, idx) => {
            const Icon = ICON_MAP[cat.name] || Tv;
            return (
              <Link
                key={cat.id || idx}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 hover:border-cyan-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center text-center justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors line-clamp-2">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-400 mt-1">
                  {cat.count ? `${cat.count} Items` : 'Explore'}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
