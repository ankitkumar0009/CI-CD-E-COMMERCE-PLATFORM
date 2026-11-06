// ==============================================================================
// SHOPSPHERE - 14 Mandatory Categories Grid
// Displays all 14 categories dynamically with icons, images, and live counts
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
  Car,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

const ICON_MAP = {
  'Electronics': Tv,
  'Fashion & Clothing': Shirt,
  'Mobile Phones': Smartphone,
  'Laptops & Computers': Laptop,
  'Shoes & Footwear': Footprints,
  'Grocery & Daily Essentials': ShoppingBasket,
  'Home & Kitchen': UtensilsCrossed,
  'Furniture': Armchair,
  'Beauty & Personal Care': Sparkles,
  'Sports & Fitness': Dumbbell,
  'Books & Stationery': BookOpen,
  'Toys & Baby Products': Baby,
  'Watches & Accessories': Watch,
  'Automotive Accessories': Car
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
        // Fallback default 14 categories
        setCategories([
          { name: 'Electronics', slug: 'electronics', description: 'Audio, cameras & appliances' },
          { name: 'Fashion & Clothing', slug: 'fashion-clothing', description: 'Trending ethnic & western' },
          { name: 'Mobile Phones', slug: 'mobile-phones', description: '5G flagships & accessories' },
          { name: 'Laptops & Computers', slug: 'laptops-computers', description: 'Gaming & creator rigs' },
          { name: 'Shoes & Footwear', slug: 'shoes-footwear', description: 'Running & formal shoes' },
          { name: 'Grocery & Daily Essentials', slug: 'grocery-daily-essentials', description: 'Organic farm staples' },
          { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Smart appliances & decor' },
          { name: 'Furniture', slug: 'furniture', description: 'Ergonomic chairs & tables' },
          { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Skincare & wellness' },
          { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Gym equipment & gear' },
          { name: 'Books & Stationery', slug: 'books-stationery', description: 'Bestsellers & journals' },
          { name: 'Toys & Baby Products', slug: 'toys-baby-products', description: 'STEM kits & child care' },
          { name: 'Watches & Accessories', slug: 'watches-accessories', description: 'Luxury automatic watches' },
          { name: 'Automotive Accessories', slug: 'automotive-accessories', description: '4K dashcams & car care' }
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
              Explore All 14 Product Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Shop verified direct sellers with authentic warranties and instant Razorpay checkout.
            </p>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 group"
          >
            Open Complete Catalog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid (Responsive 2 to 4 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
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
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
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
