const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getWishlist,
  toggleWishlist
} = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

// Cart routes
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

// Wishlist routes
router.get('/wishlist/items', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

module.exports = router;
