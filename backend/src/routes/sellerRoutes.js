const express = require('express');
const router = express.Router();
const {
  getSellerProfile,
  submitSellerKyc,
  updateStoreProfile,
  getSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateOrderStatus,
  getSellerEarnings,
  requestPayout,
  getPublicStoreBySlug
} = require('../controllers/sellerController');
const { protect } = require('../middleware/authMiddleware');

// Public storefront view
router.get('/store/:slug', getPublicStoreBySlug);

router.use(protect);

router.get('/profile', getSellerProfile);
router.post('/kyc', submitSellerKyc);
router.put('/store', updateStoreProfile);

router.get('/products', getSellerProducts);
router.post('/products', createSellerProduct);
router.put('/products/:id', updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);

router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/earnings', getSellerEarnings);
router.post('/payouts', requestPayout);

module.exports = router;

