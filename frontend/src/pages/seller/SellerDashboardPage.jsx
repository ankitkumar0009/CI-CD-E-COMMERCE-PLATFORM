// ==============================================================================
// SHOPSPHERE - Seller Portal Dashboard
// Includes KYC Verification, Store Management, Product Listings,
// Order Fulfillment Stepper, and Razorpay Route Payout Withdrawals
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Store,
  FileCheck,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Truck,
  Plus,
  ArrowUpRight,
  Clock,
  DollarSign,
  ShieldAlert,
  Save,
  Building,
  CreditCard
} from 'lucide-react';

export const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'kyc' | 'products' | 'orders'

  // Data states
  const [seller, setSeller] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // KYC Form State
  const [kycForm, setKycForm] = useState({
    panNumber: '',
    gstin: '',
    businessName: '',
    businessType: 'Private Limited',
    bankAccountNo: '',
    bankIfsc: '',
    bankName: ''
  });

  // New Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: 'cat-1',
    category: 'Electronics',
    price: '',
    comparePrice: '',
    stock: 20,
    description: '',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80'
  });

  // Payout amount state
  const [payoutAmount, setPayoutAmount] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, earningsRes, productsRes, ordersRes, catRes] = await Promise.all([
        api.getSellerProfile(),
        api.getSellerEarnings(),
        api.getSellerProducts(),
        api.getSellerOrders(),
        api.getAllCategories()
      ]);

      if (profileRes.success) {
        setSeller(profileRes.data);
        setKycForm({
          panNumber: profileRes.data.panNumber || '',
          gstin: profileRes.data.gstin || '',
          businessName: profileRes.data.businessName || '',
          businessType: profileRes.data.businessType || 'Private Limited',
          bankAccountNo: profileRes.data.bankAccountNo || '',
          bankIfsc: profileRes.data.bankIfsc || '',
          bankName: profileRes.data.bankName || ''
        });
      }

      if (earningsRes.success) setEarnings(earningsRes.data);
      if (productsRes.success) setProducts(productsRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (err) {
      console.warn('Seller data fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitSellerKyc(kycForm);
      if (res.success) {
        setMessage({ text: 'KYC documents submitted successfully. Verification in progress.', type: 'success' });
        loadData();
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSellerProduct(productForm);
      if (res.success) {
        setMessage({ text: 'Product published to marketplace successfully!', type: 'success' });
        setShowAddProduct(false);
        loadData();
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const tracking = newStatus === 'SHIPPED' ? {
        shippingCarrier: 'BlueDart Express',
        trackingNumber: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`
      } : {};

      const res = await api.updateSellerOrderStatus(orderId, newStatus, tracking);
      if (res.success) {
        setMessage({ text: `Order updated to ${newStatus}`, type: 'success' });
        loadData();
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) return;
    try {
      const res = await api.requestSellerPayout(Number(payoutAmount));
      if (res.success) {
        setMessage({ text: 'Settlement payout transferred to bank via Razorpay Route!', type: 'success' });
        setPayoutAmount('');
        loadData();
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Seller Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Seller Hub & Store Operations
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store: <span className="font-semibold text-slate-800 dark:text-slate-200">{seller?.businessName || 'Apex Innovations Pvt Ltd'}</span> • Status:{' '}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
              seller?.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
            }`}>
              {seller?.kycStatus || 'VERIFIED'}
            </span>
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview & Earnings', icon: TrendingUp },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Truck },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'kyc', label: 'KYC & Bank Details', icon: FileCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isTabActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW & EARNINGS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Sales</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{Number(earnings?.grossEarnings || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-500 font-medium">From {earnings?.totalOrders || 0} seller orders</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform Commission (8.5%)</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{Number(earnings?.totalCommissionDeducted || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">Automatic platform fee</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Seller Earnings</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{Number(earnings?.netEarnings || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">After commission deduction</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Available Settlement Balance</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{Number(earnings?.availableBalance || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold">Ready for bank transfer</span>
            </div>
          </div>

          {/* Settlement Withdrawal Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Razorpay Route Direct Settlement Payout
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Transfer funds to verified bank account ({seller?.bankAccountNo || '••••••••1234'} • IFSC: {seller?.bankIfsc || 'HDFC0000123'}).
            </p>

            <form onSubmit={handleRequestPayout} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="Enter payout amount"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  max={earnings?.availableBalance || 0}
                  className="w-full pl-8 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                Withdraw to Bank
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SELLER ORDERS */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Allocated Merchant Sub-Orders ({orders.length})
          </h3>

          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Order #{order.orderNumber}</span>
                    <p className="text-[11px] text-slate-500">Customer: {order.customerName || 'Rahul Sharma'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Payout: ₹{Number(order.netPayout).toLocaleString('en-IN')} (Fee: ₹{order.commissionAmount})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                      <span>{item.quantity}x {item.productName || item.name}</span>
                      <span className="font-semibold">₹{Number(item.total || item.price).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Status Stepper Controls */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleOrderStatusUpdate(order.id, 'ACCEPTED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-white hover:bg-cyan-600"
                    >
                      Accept Order
                    </button>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleOrderStatusUpdate(order.id, 'SHIPPED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" /> Dispatch & Ship
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleOrderStatusUpdate(order.id, 'DELIVERED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Confirm Delivery
                    </button>
                  )}
                  {order.shippingCarrier && (
                    <span className="text-[11px] text-slate-500">
                      {order.shippingCarrier}: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SELLER PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Listed Store Products ({products.length})
            </h3>
            <button
              onClick={() => setShowAddProduct(prev => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          {/* Add Product Form Modal */}
          {showAddProduct && (
            <form onSubmit={handleAddProduct} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Product to Marketplace</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category (14 Categories)</label>
                  <select
                    value={productForm.categoryId}
                    onChange={e => {
                      const selected = categories.find(c => c.id === e.target.value);
                      setProductForm({ ...productForm, categoryId: e.target.value, category: selected?.name || 'Electronics' });
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Selling Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">MRP / Compare (₹)</label>
                  <input
                    type="number"
                    value={productForm.comparePrice}
                    onChange={e => setProductForm({ ...productForm, comparePrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Publish Product
                </button>
              </div>
            </form>
          )}

          {/* Product Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id || p._id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-3">
                <img src={p.image || p.images?.[0]} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400">{p.category}</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">₹{Number(p.price).toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-slate-400">Stock: {p.stock} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KYC & BANK DETAILS */}
      {activeTab === 'kyc' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Seller Identity & Bank Settlement Information
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Official Indian compliance documentation (PAN, GSTIN, and IFSC) required by regulatory authorities and Razorpay Route.
          </p>

          <form onSubmit={handleKycSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company / Business Name</label>
                <input
                  type="text"
                  required
                  value={kycForm.businessName}
                  onChange={e => setKycForm({ ...kycForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Business Type</label>
                <select
                  value={kycForm.businessType}
                  onChange={e => setKycForm({ ...kycForm, businessType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Private Limited">Private Limited</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">PAN Number (10 Characters)</label>
                <input
                  type="text"
                  required
                  value={kycForm.panNumber}
                  onChange={e => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">GSTIN Number (15 Characters)</label>
                <input
                  type="text"
                  required
                  value={kycForm.gstin}
                  onChange={e => setKycForm({ ...kycForm, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={kycForm.bankName}
                  onChange={e => setKycForm({ ...kycForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={kycForm.bankAccountNo}
                  onChange={e => setKycForm({ ...kycForm, bankAccountNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  required
                  value={kycForm.bankIfsc}
                  onChange={e => setKycForm({ ...kycForm, bankIfsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save & Submit Verification
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
