// ==============================================================================
// SHOPSPHERE - Enterprise Multi-Vendor Navbar
// 14 Categories Dropdown, Seller Portal, Super Admin, DevOps Live Telemetry
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  Store,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export const Navbar = ({ onOpenAuth }) => {
  const {
    user,
    logout,
    isAdmin,
    isSeller,
    loginAsDemoCustomer,
    loginAsDemoSeller,
    loginAsDemoAdmin
  } = useAuth();
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { toggleTheme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState('560038 (Bengaluru)');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.getAllCategories()
      .then(res => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {
        // Fallback default 15 categories list
        setCategories([
          { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
          { id: 'cat-2', name: 'Mobile Phones', slug: 'mobile-phones' },
          { id: 'cat-3', name: 'Laptops', slug: 'laptops' },
          { id: 'cat-4', name: 'Fashion', slug: 'fashion' },
          { id: 'cat-5', name: 'Clothing', slug: 'clothing' },
          { id: 'cat-6', name: 'Shoes', slug: 'shoes' },
          { id: 'cat-7', name: 'Grocery', slug: 'grocery' },
          { id: 'cat-8', name: 'Home and Kitchen', slug: 'home-and-kitchen' },
          { id: 'cat-9', name: 'Furniture', slug: 'furniture' },
          { id: 'cat-10', name: 'Beauty Products', slug: 'beauty-products' },
          { id: 'cat-11', name: 'Sports', slug: 'sports' },
          { id: 'cat-12', name: 'Books', slug: 'books' },
          { id: 'cat-13', name: 'Watches', slug: 'watches' },
          { id: 'cat-14', name: 'Accessories', slug: 'accessories' },
          { id: 'cat-15', name: 'Toys', slug: 'toys' }
        ]);
      });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      {/* Top Notification / Role Switcher Banner */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 hidden md:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <MapPin className="w-3.5 h-3.5" /> Deliver to: <span className="text-white font-semibold cursor-pointer hover:underline">{selectedPincode}</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">⚡ Free Next-Day Delivery on orders over ₹999</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Quick Demo Switcher:</span>
            <button
              onClick={loginAsDemoCustomer}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-[11px] font-medium transition-colors"
            >
              Customer
            </button>
            <button
              onClick={loginAsDemoSeller}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-medium transition-colors"
            >
              Seller
            </button>
            <button
              onClick={loginAsDemoAdmin}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 text-[11px] font-medium transition-colors"
            >
              Super Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-cyan-600 to-indigo-600 dark:from-white dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ShopSphere
              </span>
              <span className="text-[10px] ml-1.5 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Multi-Vendor
              </span>
            </div>
          </Link>

          {/* 15 Categories Dropdown Trigger */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCategoryDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>All 15 Departments</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoryDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setCategoryDropdownOpen(false)}
              >
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shop by Department</span>
                  <Link to="/categories" className="text-[10px] font-bold text-cyan-500 hover:underline">
                    View All &rarr;
                  </Link>
                </div>
                {categories.map((cat, idx) => (
                  <Link
                    key={cat.id || idx}
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center justify-between px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-slate-400">{cat.count ? `(${cat.count})` : ''}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search 14 categories, brands, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/shop"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/shop')
                  ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Shop
            </Link>

            {/* Seller Portal Link */}
            <Link
              to="/seller"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/seller')
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-500'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-500" />
              Seller Hub
            </Link>

            {/* DevOps Observability */}
            <Link
              to="/devops"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/devops')
                  ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Activity className="w-4 h-4" />
              DevOps
            </Link>

            {/* Super Admin Panel */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-purple-500'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                Super Admin
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-cyan-500/50 transition-all"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                        {user.role}
                      </span>
                    </div>

                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <User className="w-4 h-4 text-cyan-500" />
                      My Profile & Addresses
                    </Link>

                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <ShoppingBag className="w-4 h-4 text-cyan-500" />
                      Order History & Refunds
                    </Link>

                    <Link to="/seller" className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                      <Store className="w-4 h-4" />
                      Seller Dashboard
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40">
                        <ShieldCheck className="w-4 h-4" />
                        Super Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search products & categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </form>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Catalog & 14 Categories
            </Link>
            <Link
              to="/seller"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              Seller Portal
            </Link>
            <Link
              to="/devops"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
            >
              DevOps Dashboard
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 dark:text-purple-400"
              >
                Super Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
