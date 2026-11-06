// ==============================================================================
// SHOPSPHERE - Notifications Controller
// Roles: CUSTOMER, SELLER, SUPER_ADMIN
// ==============================================================================

const store = require('../models/store');

// @desc    Get notifications for active user
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const role = req.user.role || 'CUSTOMER';
    const notifications = store.getNotifications(req.user.id, role);
    res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = store.markNotificationAsRead(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({
      success: true,
      data: notif
    });
  } catch (error) {
    next(error);
  }
};
