// ==============================================================================
// SHOPSPHERE - Enterprise Gmail & Owner Notification Service
// Secure Email Verification, One-Time Password (OTP) Engine,
// and Direct Administrative Event Alerts for Business Operations
// ==============================================================================

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EmailService {
  constructor() {
    this.ownerEmail = process.env.OWNER_EMAIL || 'owner@shopsphere.io';
    this.adminDashboardUrl = process.env.ADMIN_URL || 'http://localhost:3000/admin';
    this.otpStore = new Map(); // email -> { otpHash, expiresAt, attempts, isUsed }
    this.outboxLogs = []; // In-memory audit trail of dispatched emails
  }

  /**
   * Secure 6-Digit OTP Generator with 10-Minute Expiry
   * @param {string} email
   */
  async generateOtp(email) {
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const record = {
      email: email.toLowerCase(),
      otpHash,
      rawForLocalDev: rawOtp, // Accessible in local development logs
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      isUsed: false,
      createdAt: new Date().toISOString()
    };

    this.otpStore.set(email.toLowerCase(), record);

    // Send customer the OTP
    await this.sendCustomerOtp(email, rawOtp);

    return { success: true, expiresAt: record.expiresAt, devOtp: rawOtp };
  }

  /**
   * Verify One-Time Password
   * @param {string} email
   * @param {string} enteredOtp
   */
  async verifyOtp(email, enteredOtp) {
    const record = this.otpStore.get(email.toLowerCase());
    if (!record) {
      return { isValid: false, reason: 'No OTP requested for this email address' };
    }

    if (record.isUsed) {
      return { isValid: false, reason: 'OTP has already been used' };
    }

    if (Date.now() > record.expiresAt) {
      return { isValid: false, reason: 'OTP has expired (10 minute limit)' };
    }

    if (record.attempts >= 4) {
      return { isValid: false, reason: 'Too many incorrect attempts. Please request a new OTP' };
    }

    const isMatch = await bcrypt.compare(enteredOtp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      return { isValid: false, reason: 'Invalid OTP entered', attemptsLeft: 4 - record.attempts };
    }

    record.isUsed = true;
    return { isValid: true, reason: 'Email verified successfully' };
  }

  /**
   * Core Dispatch Engine
   */
  async sendEmail({ to, subject, htmlContent, textContent, metadata = {} }) {
    const dispatchEntry = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      to,
      subject,
      textContent: textContent || subject,
      metadata,
      sentAt: new Date().toISOString()
    };

    this.outboxLogs.unshift(dispatchEntry);
    if (this.outboxLogs.length > 500) this.outboxLogs.pop();

    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);
    return { success: true, dispatchId: dispatchEntry.id };
  }

  // --- CUSTOMER TRANSACTIONAL EMAILS ---

  async sendCustomerOtp(email, otp) {
    return this.sendEmail({
      to: email,
      subject: `Your ShopSphere Verification Code: ${otp}`,
      textContent: `Welcome to ShopSphere! Your 6-digit verification code is: ${otp}. It will expire in 10 minutes.`,
      htmlContent: `
        <h2>ShopSphere Account Verification</h2>
        <p>Your one-time verification code is:</p>
        <h1 style="color: #06B6D4; letter-spacing: 4px;">${otp}</h1>
        <p>This code is valid for 10 minutes. If you did not request this, please disregard.</p>
      `
    });
  }

  async sendCustomerApprovalStatus(email, status, reason = null) {
    const isApproved = status === 'APPROVED';
    return this.sendEmail({
      to: email,
      subject: isApproved ? 'ShopSphere Account Approved!' : 'ShopSphere Account Registration Update',
      textContent: isApproved
        ? 'Congratulations! The platform owner has reviewed and approved your customer account. You can now log in and place orders.'
        : `Your registration request was not approved: ${reason || 'Does not meet platform guidelines'}.`,
      htmlContent: `
        <h2>Account Status: ${status}</h2>
        <p>${isApproved ? 'Your account is active. You may now start shopping.' : `Reason: ${reason}`}</p>
        <a href="http://localhost:3000">Visit ShopSphere</a>
      `
    });
  }

  // --- OWNER GMAIL NOTIFICATIONS ---

  async notifyOwnerNewCustomer(customer) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] New Customer Registration: ${customer.name || customer.email}`,
      textContent: `A new customer (${customer.email}) has registered on ShopSphere and verified their email. Action may be required in Admin Dashboard: ${this.adminDashboardUrl}`,
      metadata: { customerId: customer.id, email: customer.email },
      htmlContent: `
        <h3>New Customer Registration</h3>
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Status:</strong> ${customer.accountStatus || 'OWNER_APPROVAL_PENDING'}</p>
        <p><a href="${this.adminDashboardUrl}">Open Admin Dashboard to Approve or Review</a></p>
      `
    });
  }

  async notifyOwnerVerificationRequest(customer) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Account Approval Requested: ${customer.email}`,
      textContent: `Customer ${customer.email} has completed OTP verification and is awaiting manual owner approval. Link: ${this.adminDashboardUrl}`,
      metadata: { customerId: customer.id }
    });
  }

  async notifyOwnerNewSeller(seller) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] New Merchant Registered: ${seller.businessName}`,
      textContent: `A new seller (${seller.businessName}) has registered on ShopSphere. Link: ${this.adminDashboardUrl}`,
      metadata: { sellerId: seller.id }
    });
  }

  async notifyOwnerSellerKyc(seller) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Seller KYC Submitted: ${seller.businessName} (PAN: ${seller.panNumber})`,
      textContent: `Seller ${seller.businessName} has submitted PAN (${seller.panNumber}), GSTIN (${seller.gstin}), and bank details for approval. Link: ${this.adminDashboardUrl}`,
      metadata: { sellerId: seller.id, pan: seller.panNumber }
    });
  }

  async notifyOwnerNewOrder(order) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] New Order Placed (#${order.orderNumber}) - ₹${order.total}`,
      textContent: `New order #${order.orderNumber} placed for ₹${order.total}. Payment Method: ${order.paymentMethod}. Link: ${this.adminDashboardUrl}`,
      metadata: { orderId: order.id, total: order.total }
    });
  }

  async notifyOwnerPaymentSuccess(order, payment) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Payment Confirmed: ₹${order.total} (Order #${order.orderNumber})`,
      textContent: `Payment of ₹${order.total} confirmed via ${payment.paymentMethod || 'Razorpay'}. Transaction ID: ${payment.razorpayPaymentId || payment.id}. Link: ${this.adminDashboardUrl}`,
      metadata: { orderId: order.id, paymentId: payment.id }
    });
  }

  async notifyOwnerPaymentFailed(order, reason) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Payment Failed for Order #${order.orderNumber}`,
      textContent: `Payment of ₹${order.total} failed. Reason: ${reason}. Link: ${this.adminDashboardUrl}`,
      metadata: { orderId: order.id, reason }
    });
  }

  async notifyOwnerCodOrder(order) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Cash on Delivery Order Created (#${order.orderNumber}) - ₹${order.total}`,
      textContent: `New COD order created. Total to be collected on delivery: ₹${order.total}. Link: ${this.adminDashboardUrl}`,
      metadata: { orderId: order.id, isCod: true }
    });
  }

  async notifyOwnerRefundRequested(order, refund) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Refund Requested for Order #${order.orderNumber} - ₹${refund.amount}`,
      textContent: `Customer requested refund of ₹${refund.amount}. Reason: ${refund.reason}. Link: ${this.adminDashboardUrl}`,
      metadata: { orderId: order.id, refundId: refund.id }
    });
  }

  async notifyOwnerSettlementRequest(seller, payout) {
    return this.sendEmail({
      to: this.ownerEmail,
      subject: `[Owner Alert] Seller Payout Requested: ${seller.businessName} - ₹${payout.amount}`,
      textContent: `Seller ${seller.businessName} requested a settlement withdrawal of ₹${payout.amount} to bank account ${seller.bankAccountNo}. Link: ${this.adminDashboardUrl}`,
      metadata: { sellerId: seller.id, amount: payout.amount }
    });
  }

  getOutboxLogs() {
    return this.outboxLogs;
  }
}

module.exports = new EmailService();

