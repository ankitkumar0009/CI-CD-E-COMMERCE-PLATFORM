// ==============================================================================
// SHOPSPHERE - Authentication & User Profile Controller
// Supports Email/Password, Google OAuth 2.0, Roles (Customer/Seller/Admin),
// and Multiple Delivery Addresses
// ==============================================================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const store = require('../models/store');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, businessName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const existingUser = await store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const user = await store.createUser({
      name,
      email,
      password,
      role: role ? role.toUpperCase() : 'CUSTOMER',
      businessName,
      phone
    });

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const userWithPassword = await store.findUserByEmail(email, true);
    if (!userWithPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, userWithPassword.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { password: _, passwordHash: __, ...user } = userWithPassword;
    const token = generateToken(user._id || user.id);

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth 2.0 Login / Register
const googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, name, avatarUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required' });
    }

    let user = await store.findUserByEmail(email);
    if (!user) {
      user = await store.createUser({
        name: name || email.split('@')[0],
        email,
        password: `Google_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        role: 'CUSTOMER',
        avatarUrl,
        googleId: googleId || `goog_${Date.now()}`
      });
    }

    const token = generateToken(user._id || user.id);

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await store.findUserById(req.user.id || req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    const updated = await store.updateUser(req.user.id || req.user._id, {
      ...(name && { name }),
      ...(email && { email }),
      ...(password && { password }),
      ...(avatar && { avatar, avatarUrl: avatar })
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// Customer Multiple Delivery Addresses
const getCustomerAddresses = async (req, res, next) => {
  try {
    const addresses = await store.getCustomerAddresses(req.user.id || req.user._id);
    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

const addCustomerAddress = async (req, res, next) => {
  try {
    const address = await store.addCustomerAddress(req.user.id || req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  getCustomerAddresses,
  addCustomerAddress
};
