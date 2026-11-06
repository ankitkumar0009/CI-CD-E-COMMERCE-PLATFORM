const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  requestRefund
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', getPaymentConfig);
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/webhook', handleWebhook);
router.post('/refund', protect, requestRefund);

module.exports = router;
