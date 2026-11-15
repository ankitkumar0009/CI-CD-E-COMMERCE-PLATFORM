const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register-request', requestRegistration);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/addresses', protect, getCustomerAddresses);
router.post('/addresses', protect, addCustomerAddress);

module.exports = router;
