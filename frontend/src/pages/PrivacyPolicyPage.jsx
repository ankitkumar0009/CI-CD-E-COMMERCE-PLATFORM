import React from 'react';
import { Shield, Lock, Eye, FileText, Database, Server } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-cyan-200 dark:border-cyan-800">
            <Shield className="w-3.5 h-3.5" />
            Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ShopSphere Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Last Updated: November 2026 | Effective across ShopSphere Platform & Mobile Gateways
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-sm text-slate-700 dark:text-slate-300 space-y-8 text-sm leading-relaxed">
          
          <section>
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base mb-3">
              <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              1. Overview & Information We Collect
            </div>
            <p className="mb-3">
              ShopSphere ("we", "our", or "the Platform") operates a multi-vendor marketplace connecting verified sellers with consumers. To provide authentication, order fulfillment, payment settlement, and security monitoring, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><strong>Customer Account Data:</strong> Name, verified email address, encrypted password hash, and mobile phone number for OTP dispatch.</li>
              <li><strong>Fulfillment Details:</strong> Physical shipping address, landmark, PIN code, and contact person details.</li>
              <li><strong>Merchant KYC Artifacts:</strong> Permanent Account Number (PAN), Goods & Services Tax Identification Number (GSTIN), bank account numbers, IFSC codes, and government-issued identity documents.</li>
              <li><strong>Telemetry & Session Logs:</strong> Masked IP addresses, user-agent string, device identifiers, and Prometheus system interaction metrics.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base mb-3">
              <Lock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              2. Payment & Razorpay Gateway Processing
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              ShopSphere does not store complete credit card or debit card numbers on our infrastructure. All online payments, UPI transactions, card transactions, and net-banking processes are securely routed through PCI-DSS Level 1 compliant gateway partners (including <strong>Razorpay</strong>). Transaction signatures are verified using HMAC-SHA256 server-side encryption.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base mb-3">
              <Eye className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              3. Data Usage & Platform Sharing
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your personal information is strictly restricted to authorized stakeholders necessary to complete your transactions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
              <li><strong>Sellers:</strong> We share delivery addresses and recipient names with the verified seller whose products you have purchased for order packaging and logistics handoff.</li>
              <li><strong>Delivery Logistics Partners:</strong> Delivery details and contact numbers are provided to licensed third-party couriers for order transportation and OTP-based delivery confirmation.</li>
              <li><strong>Platform Owner & Auditing:</strong> High-level transactional reports and compliance logs are audited by the Super Admin to maintain legal and tax integrity.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base mb-3">
              <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              4. Data Retention & Security Controls
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              All relational data is stored within an encrypted PostgreSQL database instance protected by Amazon RDS multi-AZ failover and AWS Secrets Manager credential rotation. Passwords undergo irreversible bcrypt salting (work factor 10). Session tokens use JSON Web Tokens (JWT) signed with 256-bit cryptographic secrets.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base mb-3">
              <Server className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              5. Contacting the Data Protection Officer
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              If you wish to request account deletion, inspect your audit log entries, or revoke notification consents, contact our security desk at <a href="mailto:privacy@shopsphere.io" className="text-cyan-600 dark:text-cyan-400 underline">privacy@shopsphere.io</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

