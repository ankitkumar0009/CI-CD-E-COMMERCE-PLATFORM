import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, HelpCircle, FileCheck } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-cyan-200 dark:border-cyan-800">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Please read these terms carefully before accessing or using ShopSphere Marketplace.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-sm text-slate-700 dark:text-slate-300 space-y-8 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              1. Acceptance & Marketplace Scope
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              By accessing the website at <span className="font-mono text-cyan-600 dark:text-cyan-400">shopsphere.io</span> or registering as a Customer, Seller, or Affiliate, you agree to be bound by these Terms and Conditions. ShopSphere serves as an intermediary multi-vendor platform facilitating transactions between independent third-party merchants ("Sellers") and buyers ("Customers").
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              2. Account Verification & Super Admin Approval
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All user accounts require dual-step security:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <li><strong>OTP Validation:</strong> Registrations require a valid one-time numeric passcode delivered via transactional email, expiring in 10 minutes.</li>
              <li><strong>Owner Approval Gate:</strong> When registration mode is configured to <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400">MODE_2</span>, accounts remain pending until reviewed and approved by the Super Admin to protect against automated spam and fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              3. Cash on Delivery (COD) Rules
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To curb frivolous orders, Cash on Delivery is subject to the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <li>The maximum single cart value permitted for Cash on Delivery is <strong>₹25,000 INR</strong>. Orders exceeding this limit must be prepaid via Razorpay.</li>
              <li>Customers must tender exact cash or scan dynamic delivery agent UPI QR codes upon doorstep handover.</li>
              <li>Repeated unfulfilled COD deliveries may result in account restriction.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              4. Seller Obligations & Commission
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sellers agree to accurately describe products, fulfill accepted sub-orders within 48 hours, honor warranties, and remit platform commissions as determined in the Super Admin Commission Schedule. Failure to supply genuine merchandise constitutes immediate permanent suspension and forfeiture of pending settlement balances.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

