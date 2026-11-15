import React from 'react';
import { Truck, MapPin, PackageCheck, AlertCircle, Clock } from 'lucide-react';

export const ShippingPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-cyan-200 dark:border-cyan-800">
            <Truck className="w-3.5 h-3.5" />
            Pan-India Logistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Learn how ShopSphere coordinates multi-vendor shipping, tracking, and courier handovers.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-sm text-slate-700 dark:text-slate-300 space-y-8 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              1. Multi-Vendor Split Shipments
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Because ShopSphere is a multi-vendor marketplace, items purchased in a single checkout may originate from different merchant facilities located across India. Consequently:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <li>Your order is split into distinct sub-orders, each fulfilled and dispatched by its respective verified seller.</li>
              <li>You receive unique tracking numbers and delivery estimates for each parcel.</li>
              <li>Packages may arrive at your delivery address at different times and on different dates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              2. Standard & Express Delivery Timelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Metro Cities</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">24 to 48 Hours</p>
                <p className="text-xs text-slate-500 mt-1">Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Rest of India</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">3 to 5 Business Days</p>
                <p className="text-xs text-slate-500 mt-1">Tier-2, Tier-3 cities, regional towns, and rural serviceable PIN codes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              3. Serviceable PIN Codes & Verification
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We service over 19,000+ PIN codes across all Indian states and Union Territories through tier-1 courier integrations (Bluedart, Delhivery, Ecom Express, India Post). Use the PIN code checker on product detail pages to see real-time transit times for your locality.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              4. Doorstep OTP Security & Tamper Check
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              High-value electronic goods and luxury items require a 4-digit Delivery OTP sent to your registered phone number. Never share your delivery OTP until the parcel is physically in your hand and the outer tamper-evident seal is intact.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

