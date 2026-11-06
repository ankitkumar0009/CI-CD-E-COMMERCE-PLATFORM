import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Headphones, Watch, Camera, Gamepad2, Home, ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Laptops & Computers',
    description: 'Apple M3 Pro/Max, Workstations, 4K USB-C Displays',
    icon: Laptop,
    count: '24 Items',
    color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400',
    link: '/shop?category=Laptops+%26+Computers'
  },
  {
    name: 'Audio & Headphones',
    description: 'Active Noise Cancellation, Studio Monitors, Spatial Audio',
    icon: Headphones,
    count: '18 Items',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
    link: '/shop?category=Audio+%26+Headphones'
  },
  {
    name: 'Smart Devices & Wearables',
    description: 'Titanium GPS Watches, Smart Rings, Health Trackers',
    icon: Watch,
    count: '15 Items',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    link: '/shop?category=Smart+Devices+%26+Wearables'
  },
  {
    name: 'Cameras & Video',
    description: 'Full-frame 4K 60p mirrorless & Cinema optics',
    icon: Camera,
    count: '12 Items',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    link: '/shop?category=Cameras+%26+Video'
  },
  {
    name: 'Gaming & Peripherals',
    description: 'Custom CNC mechanical keyboards, 8K DPI mice, 240Hz OLEDs',
    icon: Gamepad2,
    count: '29 Items',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
    link: '/shop?category=Gaming+%26+Peripherals'
  },
  {
    name: 'Smart Home',
    description: 'Ambient 16M lighting, HomeKit & Matter automation hub',
    icon: Home,
    count: '14 Items',
    color: 'from-cyan-500/20 to-blue-500/20 border-blue-500/30 text-blue-400',
    link: '/shop?category=Smart+Home'
  }
];

export const CategoryGrid = () => {
  return (
    <section className="py-16 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Browse by Engineering Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 group"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.link}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <span>{cat.count}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

