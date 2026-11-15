// ==============================================================================
// SHOPSPHERE - Authentication & Customer Verification Controller
// Supports Email/Password, Email OTP, Google OAuth 2.0,
// Owner Approval Workflow (MODE 1 / MODE 2), and Multi-Address Management
// ==============================================================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const store = require('../models/store');
const emailService = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Step 1: Initiate Customer Registration -> Send OTP & Alert Owner
 * @route POST /api/auth/register-request
 */
const requestRegistration = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, businessName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email address, and password are required'
      });
    }

    const result = await store.requestCustomerRegistration({
      name,
      email,
      password,
      phone,
      role: role || 'CUSTOMER',
      businessName
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId,
        email: result.email,
        accountStatus: result.accountStatus,
        devOtp: result.devOtp // Visible in response for easy local testing
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2: Verify 6-digit OTP from Email
 * @route POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and 6-digit OTP are required'
      });
    }

    const result = await store.verifyCustomerOtp(email, otp);

    let token = null;
    if (result.isApproved) {
      token = generateToken(result.userId);
    }

    res.json({
      success: true,
      message: result.isApproved
        ? 'Account email verified and approved! You may now sign in.'
        : 'Email verified successfully. Your account is now pending owner approval. You will be notified once activated.',
      data: {
        ...result,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Resend Verification OTP
 * @route POST /api/auth/resend-otp
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const otpResult = await emailService.generateOtp(email);
    res.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched to your email.',
      data: { devOtp: otpResult.devOtp }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Standard Registration (Instant creation for automated tests and backwards compatibility)
 * @route POST /api/auth/register
 */
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

/**
 * Login with Account Verification and Status Gatekeeping
 * @route POST /api/auth/login
 */
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

    // Status Gatekeeping
    const status = userWithPassword.accountStatus || 'APPROVED';
    if (status === 'EMAIL_VERIFICATION_PENDING') {
      return res.status(403).json({
        success: false,
        accountStatus: status,
        message: 'Email verification pending. Please enter the OTP sent to your email.'
      });
    }

    if (status === 'OWNER_APPROVAL_PENDING') {
      return res.status(403).json({
        success: false,
        accountStatus: status,
        message: 'Your account has verified its email and is currently awaiting platform owner approval.'
      });
    }

    if (status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        accountStatus: status,
        message: `Your account registration was not approved: ${userWithPassword.rejectionReason || 'Contact platform support'}`
      });
    }

    if (status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        accountStatus: status,
        message: 'This account has been suspended by the platform administrator.'
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

/**
 * Google OAuth 2.0 Login / Registration
 * @route POST /api/auth/google
 */
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

      // Notify Owner of Google registration
      await emailService.notifyOwnerNewCustomer(user);
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
  requestRegistration,
  verifyOtp,
  resendOtp,
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  getCustomerAddresses,
  addCustomerAddress
};
