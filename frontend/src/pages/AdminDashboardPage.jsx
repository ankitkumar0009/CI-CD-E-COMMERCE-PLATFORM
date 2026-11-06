// ==============================================================================
// SHOPSPHERE - Super Admin Dashboard Page
// Full Marketplace Owner Control: GMV, Platform Commission, Seller KYC Approvals,
// Category CRUD (14 Categories), Settlements, Order Moderation, and Financial CSV Export
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  Box,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  TrendingUp,
  ShieldCheck,
  Store,
  FileText,
  Download,
  Percent,
  Check,
  Layers,
  RefreshCw
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sellers' | 'categories' | 'orders' | 'products'
  const [analytics, setAnalytics] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: 'ShoppingBag' });

  // Commission Edit State
  const [editingCommissionSellerId, setEditingCommissionSellerId] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, sellersRes, catRes, ordersRes, productsRes] = await Promise.all([
        api.getAdminAnalytics().catch(() => ({ success: false })),
        api.getAllSellers().catch(() => ({ success: false })),
        api.getAllCategories().catch(() => ({ success: false })),
        api.getAllOrders().catch(() => ({ success: false })),
        api.getProducts({ limit: 100 }).catch(() => ({ success: false }))
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (sellersRes.success) setSellers(sellersRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (productsRes.success && productsRes.data.products) setProducts(productsRes.data.products);
    } catch (err) {
      console.warn('Super Admin load notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveSeller = async (sellerId) => {
    try {
      const res = await api.approveSellerKyc(sellerId);
      if (res.success) {
        setActionNotice('Seller KYC approved successfully');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    const reason = prompt('Enter rejection reason for seller:', 'Incomplete GSTIN documentation');
    if (!reason) return;
    try {
      const res = await api.rejectSellerKyc(sellerId, reason);
      if (res.success) {
        setActionNotice('Seller KYC rejected with feedback');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCommission = async (sellerId) => {
    try {
      const res = await api.updateSellerCommission(sellerId, newCommissionRate);
      if (res.success) {
        setActionNotice(`Commission rate updated to ${newCommissionRate}%`);
        setEditingCommissionSellerId(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCategory(catForm);
      if (res.success) {
        setActionNotice('New category created successfully');
        setShowCatModal(false);
        setCatForm({ name: '', slug: '', description: '', icon: 'ShoppingBag' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.deleteCategory(id);
      if (res.success) {
        setActionNotice('Category removed');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Super Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              ShopSphere Owner & Super Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global Marketplace Control: Multi-Vendor Settlements, 14 Category CRUD, and Financial Observability
          </p>
        </div>

        {/* Financial Export & Refresh */}
        <div className="flex items-center gap-3">
          <a
            href={api.getFinancialReportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 hover:bg-cyan-600 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Financials (CSV)
          </a>
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-semibold flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-8 overflow-x-auto">
        {[
          { id: 'overview', label: 'Marketplace Metrics', icon: TrendingUp },
          { id: 'sellers', label: `Sellers & KYC (${sellers.length})`, icon: Store },
          { id: 'categories', label: `14 Categories (${categories.length})`, icon: Layers },
          { id: 'orders', label: `Orders & Settlements (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: `Products (${products.length})`, icon: Box }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MARKETPLACE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total GMV (Gross Merchandise Value)</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{Number(analytics?.totalGMV || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-500 font-medium">Across all marketplace merchants</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/30 shadow-sm ring-1 ring-purple-500/20">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Net Platform Commission</span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                ₹{Number(analytics?.platformCommission || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">Net platform revenue retained</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders Placed</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {analytics?.totalOrders || 0}
              </p>
              <span className="text-[11px] text-emerald-500 font-medium">{analytics?.successfulPayments || 0} Successful Razorpay payments</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sellers & Stores</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {analytics?.totalSellers || sellers.length}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">{categories.length} active departments</span>
            </div>
          </div>

          {/* Secondary Metric Strips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">Seller Settlements Transferred</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{Number(analytics?.totalSellerSettlements || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-slate-500 mt-0.5">Automated via Razorpay Route</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase">Pending Fulfillment Orders</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {analytics?.pendingOrders || 0}
              </p>
              <p className="text-slate-500 mt-0.5">Awaiting merchant dispatch</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400 uppercase">Refunds Processed</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{Number(analytics?.totalRefunds || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-slate-500 mt-0.5">Zero payment disputes</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SELLERS & KYC APPROVALS */}
      {activeTab === 'sellers' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registered Sellers & KYC Verification ({sellers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Store & Seller</th>
                  <th className="p-3">PAN & GSTIN</th>
                  <th className="p-3">Bank Settlement Details</th>
                  <th className="p-3">Commission %</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sellers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      <div>{s.businessName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{s.user?.email || 'seller@shopsphere.io'}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div>PAN: <span className="font-bold">{s.panNumber}</span></div>
                      <div>GST: <span className="font-bold">{s.gstin}</span></div>
                    </td>
                    <td className="p-3 text-[11px]">
                      <div>{s.bankName}</div>
                      <div className="text-slate-400">A/C: {s.bankAccountNo} • IFSC: {s.bankIfsc}</div>
                    </td>
                    <td className="p-3">
                      {editingCommissionSellerId === s.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={newCommissionRate}
                            onChange={e => setNewCommissionRate(e.target.value)}
                            className="w-14 px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 border"
                          />
                          <button onClick={() => handleUpdateCommission(s.id)} className="p-1 rounded bg-purple-600 text-white"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setEditingCommissionSellerId(null)} className="p-1 text-slate-400"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">{s.commissionRate || 10}%</span>
                          <button onClick={() => { setEditingCommissionSellerId(s.id); setNewCommissionRate(s.commissionRate || 10); }} className="text-slate-400 hover:text-purple-500">
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {s.kycStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {s.kycStatus !== 'APPROVED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveSeller(s.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectSeller(s.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-500 text-xs font-semibold">Active Merchant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 14 MANDATORY CATEGORIES CRUD */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              14 Product Categories (Super Admin Management)
            </h3>
            <button
              onClick={() => setShowCatModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {/* Add Category Modal */}
          {showCatModal && (
            <form onSubmit={handleCreateCategory} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/30 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600">Create New Department</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Smart Wearables)"
                  required
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  className="px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border"
                />
                <input
                  type="text"
                  placeholder="Slug (optional)"
                  value={catForm.slug}
                  onChange={e => setCatForm({ ...catForm, slug: e.target.value })}
                  className="px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={catForm.description}
                onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-3 py-1.5 text-xs text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-purple-600 text-white rounded-lg">Save Category</button>
              </div>
            </form>
          )}

          {/* Category Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, idx) => (
              <div key={cat.id || idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.description || 'Verified Category'}</p>
                  <span className="text-[10px] text-cyan-500 font-semibold">{cat.count || 0} products listed</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & SETTLEMENTS */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Platform Orders & Financial Settlements ({orders.length})
          </h3>

          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id || order.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Order #{order.orderNumber}</div>
                  <div className="text-slate-500">Customer: {order.userName || 'Rahul Sharma'} ({order.userEmail})</div>
                  <div className="text-slate-400 mt-0.5">Payment: <span className="text-emerald-500 font-semibold">{order.paymentStatus || 'PAID'}</span> • Gateway: {order.paymentMethod || 'RAZORPAY'}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">₹{Number(order.total).toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-slate-400">{order.sellerOrders?.length || 1} seller sub-order(s)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                    {order.orderStatus || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTS MODERATION */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Catalog Products Moderation ({products.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id || p._id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex gap-3 text-xs">
                <img src={p.image || p.images?.[0]} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                  <p className="text-[11px] text-cyan-500">{p.category}</p>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-1">₹{Number(p.price).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">Sold by: {p.sellerName || 'Verified Store'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
