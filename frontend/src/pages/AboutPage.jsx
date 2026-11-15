import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Zap, Award, Globe, Store, Users, Cpu, ArrowRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-cyan-200 dark:border-cyan-800">
            <Globe className="w-3.5 h-3.5" />
            Next-Gen E-Commerce Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Empowering Modern Commerce at Cloud Scale
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            ShopSphere is a multi-vendor digital marketplace engineered for hyper-scale reliability, multi-tier merchant settlements, and an Amazon/Flipkart-grade shopping experience.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: 'Verified Sellers', value: '5,000+', icon: Store, color: 'text-cyan-500' },
            { label: 'Active Customers', value: '250,000+', icon: Users, color: 'text-indigo-500' },
            { label: 'Product Catalog', value: '15 Departments', icon: Award, color: 'text-amber-500' },
            { label: 'Cluster Uptime', value: '99.99%', icon: Cpu, color: 'text-emerald-500' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Core Pillars */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Why ShopSphere Stands Apart</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Built on three uncompromising engineering pillars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verified Merchant Ecosystem</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every merchant undergoes rigorous Aadhaar, PAN, GSTIN, and bank verification before listing products. Counterfeits and non-compliant vendors are eliminated at onboarding.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Real-Time Split Settlements</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                State-of-the-art Razorpay Route payment automation splits multi-vendor cart payments directly into merchant bank accounts after deducing platform commission.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pan-India Express Fulfillment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Integrated tracking and pincode validation across 19,000+ Indian postal codes ensure guaranteed delivery SLAs, OTP confirmations, and cash-on-delivery safeguards.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to sell across India?</h3>
            <p className="mt-2 text-sm text-cyan-100 leading-relaxed">
              Join thousands of thriving manufacturers, retailers, and direct-to-consumer brands on the ShopSphere marketplace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/seller"
              className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 shadow-md transition-all flex items-center gap-2"
            >
              <span>Launch Seller Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-cyan-900/40 border border-white/20 text-white font-semibold text-sm hover:bg-cyan-900/60 transition-all"
            >
              Explore Shop
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

