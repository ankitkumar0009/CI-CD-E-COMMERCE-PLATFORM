import React from 'react';
import { RotateCcw, Clock, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-cyan-200 dark:border-cyan-800">
            <RotateCcw className="w-3.5 h-3.5" />
            Customer Protection Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Transparent, automated refund processing for all ShopSphere orders.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-sm text-slate-700 dark:text-slate-300 space-y-8 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              1. 7-Day Return & Replacement Window
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Customers can initiate a return or replacement request within <strong>7 calendar days</strong> from the recorded delivery timestamp. Eligible items include defective products, damaged in transit, missing components, or items significantly different from the product listing specifications.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              2. Razorpay Refund Disbursement Timelines
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Once a return is received and verified by the merchant or platform inspector, the refund is automatically dispatched through the Razorpay refund engine back to the original source:
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3">Payment Instrument</th>
                    <th className="p-3">Estimated Refund SLA</th>
                    <th className="p-3">Status Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">UPI (Google Pay, PhonePe, Paytm)</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Instant to 24 Hours</td>
                    <td className="p-3">Direct bank UTR number</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Credit Cards & Debit Cards</td>
                    <td className="p-3">3 to 5 Business Days</td>
                    <td className="p-3">ARN Reference Number</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Net Banking</td>
                    <td className="p-3">4 to 7 Business Days</td>
                    <td className="p-3">Bank confirmation reference</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Cash on Delivery (COD)</td>
                    <td className="p-3">2 to 3 Business Days</td>
                    <td className="p-3">Direct IMPS/NEFT to saved account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              3. Non-Returnable Categories
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In accordance with consumer health & safety regulations, the following categories are strictly non-returnable once opened:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <li>Perishable grocery, fresh dairy, and food staples.</li>
              <li>Innerwear, lingerie, swimwear, and personal hygiene products.</li>
              <li>Cosmetic and skincare items with broken tamper-evident seals.</li>
              <li>Customized or engraved merchandise.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              4. How to Request a Refund
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Go to your <Link to="/orders" className="text-cyan-600 dark:text-cyan-400 underline font-semibold">Orders Page</Link>, select the delivered item, click <strong>"Request Refund / Return"</strong>, upload photos of the item condition, and submit. The merchant will review and approve pickup within 24 hours.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

