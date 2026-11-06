// ==============================================================================
// SHOPSPHERE - Customer Orders & Real-time Tracking Page
// Multi-Vendor Merchant Sub-Orders, Live Progress Timeline & Refund Requests
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('Product damaged or different from specification');
  const [refundStatusMessage, setRefundStatusMessage] = useState('');

  const loadOrders = () => {
    setLoading(true);
    api.getMyOrders()
      .then(res => {
        if (res.success && res.data) {
          setOrders(res.data);
          if (res.data.length > 0) setSelectedOrder(res.data[0]);
        }
      })
      .catch(err => console.warn('Could not load orders:', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.requestRefund(selectedOrder._id || selectedOrder.id, refundReason, selectedOrder.total);
      if (res.success) {
        setRefundStatusMessage('Refund initiated and verified successfully via Razorpay');
        setShowRefundModal(false);
        loadOrders();
      }
    } catch (err) {
      setRefundStatusMessage('Refund error: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'Delivered':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/30';
      case 'SHIPPED':
      case 'Shipped':
        return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500/30';
      case 'CONFIRMED':
      case 'Processing':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-500/30';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-500/30';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Order History & Multi-Vendor Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track package delivery progress from verified merchants directly to your address
          </p>
        </div>

        {refundStatusMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{refundStatusMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No orders placed yet</h2>
            <p className="text-xs text-slate-500">Explore products across 14 categories and pay securely via Razorpay.</p>
            <Link to="/shop" className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-white shadow">
              Open Marketplace Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Orders List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id || order.id || order.orderNumber}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                    (selectedOrder?._id === order._id || selectedOrder?.id === order.id)
                      ? 'bg-white dark:bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.orderStatus || order.status)}`}>
                      {order.orderStatus || order.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    ))}
                    {order.items?.length > 3 && (
                      <span className="text-xs text-slate-400 font-semibold">+{order.items.length - 3} more</span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                    <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                      ₹{Number(order.total || order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Order Detailed View & Tracking (7 cols) */}
            {selectedOrder && (
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">

                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">ORDER REFERENCE</span>
                      <h3 className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                        {selectedOrder.orderNumber}
                      </h3>
                      <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">
                        Payment: {selectedOrder.paymentStatus || 'PAID'} ({selectedOrder.paymentMethod || 'RAZORPAY'})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedOrder.paymentStatus !== 'REFUNDED' && (
                        <button
                          onClick={() => setShowRefundModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Request Refund
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Merchant Sub-Orders Fulfillment Breakdown */}
                  {selectedOrder.sellerOrders && selectedOrder.sellerOrders.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Merchant Dispatch Hubs ({selectedOrder.sellerOrders.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.sellerOrders.map((so, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{so.storeName || 'Verified Merchant Store'}</p>
                              <p className="text-slate-400 text-[11px]">
                                {so.shippingCarrier ? `${so.shippingCarrier} (${so.trackingNumber})` : 'Order Accepted & Being Packed'}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-500">
                              {so.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Progress Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                      Live Delivery Progress
                    </h4>
                    <div className="space-y-4">
                      {selectedOrder.timeline?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className={`text-xs font-bold ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                              {step.title}
                            </p>
                            {step.timestamp && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {new Date(step.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                      Ordered Products
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80'}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-start gap-3 text-xs text-slate-500">
                      <MapPin className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">Delivery Address: </strong>
                        <span>
                          {selectedOrder.shippingAddress.addressLine1 || selectedOrder.shippingAddress.street},{' '}
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                          {selectedOrder.shippingAddress.postalCode}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

        {/* Refund Request Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Request Order Refund
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Full amount of ₹{Number(selectedOrder?.total || selectedOrder?.totalAmount).toLocaleString('en-IN')} will be credited back to your original Razorpay payment method.
              </p>

              <form onSubmit={handleRequestRefund} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Select Reason</label>
                  <select
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Product damaged or defective">Product damaged or defective</option>
                    <option value="Item did not match description">Item did not match description</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Delivery delayed beyond promised date">Delivery delayed beyond promised date</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Confirm & Submit Refund
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
