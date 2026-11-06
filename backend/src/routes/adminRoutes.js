const express = require('express');
const router = express.Router();
const store = require('../models/store');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, async (req, res, next) => {
  try {
    const analytics = await store.getAnalytics();
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
