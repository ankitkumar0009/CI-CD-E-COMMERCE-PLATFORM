// ==============================================================================
// SHOPSPHERE - Real Razorpay Payment Controller
// Cryptographic Signature Verification, Webhooks, Route Transfers & Refunds
// ==============================================================================

const razorpayService = require('../services/razorpayService');
const store = require('../models/store');

// @desc    Get Razorpay public client configuration
// @route   GET /api/payments/config
// @access  Public
exports.getPaymentConfig = (req, res) => {
  const config = razorpayService.getPublicConfig();
  res.json({
    success: true,
    data: config
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, receipt, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const razorpayOrder = await razorpayService.createOrder(
      parseFloat(amount),
      receipt || `rcpt_${req.user.id}_${Date.now()}`,
      {
        userId: req.user.id,
        userEmail: req.user.email,
        ...notes
      }
    );

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: razorpayOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature and finalize Order
// @route   POST /api/payments/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay signature verification parameters'
      });
    }

    // Cryptographic HMAC-SHA256 verification
    const verification = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature',
        reason: verification.reason
      });
    }

    // Payment signature is authentic. Now finalize the multi-vendor order.
    let order;
    if (orderData) {
      order = await store.createOrder({
        ...orderData,
        userId: req.user.id,
        userEmail: req.user.email,
        userName: `${req.user.firstName || req.user.name || 'Customer'}`,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID'
      });
    }

    // Record payment
    const paymentRecord = {
      id: `pay_${Date.now()}`,
      orderId: order ? (order.id || order._id) : null,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: order ? order.total : 0,
      currency: 'INR',
      status: 'PAID',
      paymentMethod: 'RAZORPAY',
      createdAt: new Date().toISOString()
    };
    store.payments.push(paymentRecord);

    store.logAction('PAYMENT_VERIFIED', 'Payment', paymentRecord.id, {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderId: order?.id
    });

    res.json({
      success: true,
      message: 'Razorpay payment verified and order processed successfully',
      data: {
        order,
        payment: paymentRecord,
        verificationMethod: verification.method || 'HMAC-SHA256'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public (Signature protected)
exports.handleWebhook = async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    const isAuthentic = razorpayService.verifyWebhookSignature(rawBody, webhookSignature);
    if (!isAuthentic && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      console.log(`[Razorpay Webhook] Payment ${payment.id} captured for amount ₹${payment.amount / 100}`);
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      console.warn(`[Razorpay Webhook] Payment ${payment.id} failed: ${payment.error_description}`);
    }

    res.json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Request Refund for an Order
// @route   POST /api/payments/refund
// @access  Private
exports.requestRefund = async (req, res, next) => {
  try {
    const { orderId, reason, amount } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const refund = await store.requestRefund(orderId, reason, amount);

    res.json({
      success: true,
      message: 'Refund requested and processed successfully',
      data: refund
    });
  } catch (error) {
    next(error);
  }
};
