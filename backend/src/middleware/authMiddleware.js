const jwt = require('jsonwebtoken');
const config = require('../config');
const store = require('../models/store');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Access token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await store.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token'
    });
  }
};

const adminOnly = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required'
    });
  }
};

const sellerOnly = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  if (role === 'SELLER' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Seller privileges required'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await store.findUserById(decoded.id);
      if (user) req.user = user;
    } catch (e) {
      // Ignore invalid token for optional auth
    }
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  sellerOnly,
  optionalAuth
};
