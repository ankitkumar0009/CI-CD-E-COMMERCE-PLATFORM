const store = require('../models/store');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : req.headers['x-session-id'] || 'guest_default';
    const items = await store.getCart(userId);
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : req.headers['x-session-id'] || 'guest_default';
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const items = await store.addToCart(userId, {
      productId,
      quantity: parseInt(quantity, 10) || 1
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 150 ? 0 : 15.00;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : req.headers['x-session-id'] || 'guest_default';
    const { itemId } = req.params;
    const { quantity } = req.body;

    const items = await store.updateCartItem(userId, itemId, parseInt(quantity, 10));

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : req.headers['x-session-id'] || 'guest_default';
    const { itemId } = req.params;

    const items = await store.removeCartItem(userId, itemId);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : req.headers['x-session-id'] || 'guest_default';
    await store.clearCart(userId);

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 }
    });
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'usr_demo_002';
    const items = await store.getWishlist(userId);

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'usr_demo_002';
    const { productId } = req.params;

    const result = await store.toggleWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: result.added ? 'Added to wishlist' : 'Removed from wishlist',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getWishlist,
  toggleWishlist
};
