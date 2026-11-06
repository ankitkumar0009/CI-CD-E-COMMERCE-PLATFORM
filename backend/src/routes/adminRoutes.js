const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getAllSellers,
  approveSellerKyc,
  rejectSellerKyc,
  updateSellerCommission,
  getAllOrders,
  getAllRefunds,
  getAllUsers,
  toggleUserStatus,
  exportFinancialReport
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/analytics', getAdminAnalytics);
router.get('/sellers', getAllSellers);
router.put('/sellers/:id/approve', approveSellerKyc);
router.put('/sellers/:id/reject', rejectSellerKyc);
router.put('/sellers/:id/commission', updateSellerCommission);
router.get('/orders', getAllOrders);
router.get('/refunds', getAllRefunds);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/export/financials', exportFinancialReport);

module.exports = router;
