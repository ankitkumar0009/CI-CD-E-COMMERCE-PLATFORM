import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    api.getMyOrders()
      .then(res => {
        if (res.success && res.data) {
          setOrders(res.data);
          if (res.data.length > 0) setSelectedOrder(res.data[0]);
        }
      })
      .catch(err => console.warn('Could not load orders:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/30';
      case 'Shipped':
        return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500/30';
      case 'Processing':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-500/30';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Order History & Real-Time Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track package progress from AWS Fulfillment centers to your doorstep
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No orders yet</h2>
            <p className="text-xs text-slate-500">You haven't placed any orders on this account yet.</p>
            <Link to="/shop" className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-white shadow">
              Explore Hardware Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Orders List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id || order.orderNumber}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                    selectedOrder?._id === order._id
                      ? 'bg-white dark:bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image}
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
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">${order.total?.toFixed(2)}</span>
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
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">TRACKING NUMBER</span>
                      <p className="text-xs font-mono font-bold text-cyan-500">
                        {selectedOrder.trackingNumber || 'TRK-US-AWS-902311'}
                      </p>
                    </div>
                  </div>

                  {/* Visual Tracking Progress Timeline */}
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
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            ${(item.price * item.quantity).toFixed(2)}
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
                        <strong className="text-slate-900 dark:text-white">Shipping Destination: </strong>
                        <span>
                          {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                          {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode},{' '}
                          {selectedOrder.shippingAddress.country}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
