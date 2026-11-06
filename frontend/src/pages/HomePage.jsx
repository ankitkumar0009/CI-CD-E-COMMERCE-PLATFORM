import React, { useState, useEffect } from 'react';
import { Hero3D } from '../components/home/Hero3D';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ArchitectureDiagram } from '../components/home/ArchitectureDiagram';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ limit: 4 })
      .then(res => {
        if (res.success && res.data.products) {
          setFeaturedProducts(res.data.products);
        }
      })
      .catch(err => console.warn('Could not fetch featured products:', err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* 3D Animated Hero Section */}
      <Hero3D />

      {/* Feature Highlights Banner */}
      <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Free Express Shipping</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">On all orders over $150</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">2-Year Official Warranty</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Genuine manufacturer coverage</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">24/7 Expert SRE Support</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated incident response</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">30-Day Hassle-Free Returns</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant prepaid return labels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <CategoryGrid />

      {/* Featured Products Showcase */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Flagships
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Trending High-Performance Hardware
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-4 md:mt-0 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 group"
            >
              Browse Full Catalog
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="rounded-2xl bg-white dark:bg-slate-800 p-4 h-80 animate-pulse border border-slate-200 dark:border-slate-700" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cloud & DevOps Architecture Diagram Section */}
      <ArchitectureDiagram />

    </div>
  );
};
