const store = require('../models/store');
const { orderCounter, revenueCounter } = require('../middleware/metricsMiddleware');

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, tax, shippingFee, discount, total } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Valid shipping address is required'
      });
    }

    const order = await store.createOrder({
      userId: req.user ? req.user._id : 'usr_demo_002',
      userEmail: req.user ? req.user.email : 'guest@ecommerce.io',
      userName: req.user ? req.user.name : (shippingAddress.fullName || 'Valued Customer'),
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shippingFee,
      discount,
      total
    });

    // Increment Prometheus business metrics
    orderCounter.inc();
    revenueCounter.inc(total);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'usr_demo_002';
    const orders = await store.findOrdersByUser(userId);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await store.findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization: must be owner or admin
    if (req.user && req.user.role !== 'admin' && order.user !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await store.findAllOrders();
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await store.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
