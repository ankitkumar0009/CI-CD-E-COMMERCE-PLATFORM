const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', optionalAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

// Admin order routes
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
