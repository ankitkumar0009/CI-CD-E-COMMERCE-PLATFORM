const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  requestRefund,
  getUpiQrCode
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', getPaymentConfig);
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/upi-qr', protect, getUpiQrCode);
router.post('/webhook', handleWebhook);
router.post('/refund', protect, requestRefund);

module.exports = router;

