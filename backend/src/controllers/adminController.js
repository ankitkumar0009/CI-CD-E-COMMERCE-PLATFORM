// ==============================================================================
// SHOPSPHERE - Super Admin Dashboard Controller
// GMV, Commissions, Customer Approval Workflow (MODE 1 / MODE 2),
// Seller KYC Approvals, COD Cash Collections, Refunds, Settlements & User Controls
// ==============================================================================

const store = require('../models/store');

// @desc    Get Super Admin Marketplace Overview & Metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const analytics = await store.getSuperAdminAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending customer account verification approvals
// @route   GET /api/admin/pending-approvals
// @access  Private/Admin
exports.getPendingCustomerApprovals = async (req, res, next) => {
  try {
    const pending = await store.getPendingCustomerApprovals();
    res.json({
      success: true,
      count: pending.length,
      data: pending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve customer registration request (Owner Action)
// @route   PUT /api/admin/customers/:id/approve
// @access  Private/Admin
exports.approveCustomerAccount = async (req, res, next) => {
  try {
    const approved = await store.approveCustomer(req.params.id);
    res.json({
      success: true,
      message: `Customer ${approved.name} has been approved and activated. Notification sent.`,
      data: approved
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reject customer registration request (Owner Action)
// @route   PUT /api/admin/customers/:id/reject
// @access  Private/Admin
exports.rejectCustomerAccount = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const rejected = await store.rejectCustomer(req.params.id, reason);
    res.json({
      success: true,
      message: `Customer ${rejected.name} registration was rejected with feedback.`,
      data: rejected
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Set Customer Registration Mode (MODE 1 vs MODE 2)
// @route   PUT /api/admin/settings/registration-mode
// @access  Private/Admin
exports.setRegistrationMode = async (req, res, next) => {
  try {
    const { mode } = req.body;
    const currentMode = store.setRegistrationMode(mode);
    res.json({
      success: true,
      message: `Registration mode set to ${currentMode}`,
      data: { registrationMode: currentMode }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Confirm Cash on Delivery Collection at Doorstep
// @route   PUT /api/admin/orders/:id/cod-collected
// @access  Private/Admin
exports.confirmCodCollection = async (req, res, next) => {
  try {
    const updatedOrder = await store.confirmCodCollection(req.params.id);
    res.json({
      success: true,
      message: `Cash on Delivery for order #${updatedOrder.orderNumber} confirmed as COLLECTED.`,
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered sellers and stores
// @route   GET /api/admin/sellers
// @access  Private/Admin
exports.getAllSellers = async (req, res, next) => {
  try {
    const sellers = await store.getAllSellers();
    res.json({
      success: true,
      count: sellers.length,
      data: sellers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve Seller KYC
// @route   PUT /api/admin/sellers/:id/approve
// @access  Private/Admin
exports.approveSellerKyc = async (req, res, next) => {
  try {
    const approved = await store.approveSeller(req.params.id);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    res.json({
      success: true,
      message: 'Seller KYC approved successfully',
      data: approved
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject Seller KYC
// @route   PUT /api/admin/sellers/:id/reject
// @access  Private/Admin
exports.rejectSellerKyc = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const rejected = await store.rejectSeller(req.params.id, reason);
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    res.json({
      success: true,
      message: 'Seller KYC rejected with feedback',
      data: rejected
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Seller Commission Percentage
// @route   PUT /api/admin/sellers/:id/commission
// @access  Private/Admin
exports.updateSellerCommission = async (req, res, next) => {
  try {
    const { rate } = req.body;
    const seller = await store.getSellerById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    seller.commissionRate = parseFloat(rate);
    res.json({
      success: true,
      message: `Commission rate updated to ${rate}%`,
      data: seller
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customer and platform orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await store.findAllOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all refunds
// @route   GET /api/admin/refunds
// @access  Private/Admin
exports.getAllRefunds = async (req, res, next) => {
  try {
    const refunds = await store.getAllRefunds();
    res.json({
      success: true,
      count: refunds.length,
      data: refunds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with role status
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const safeUsers = store.users.map(u => {
      const { passwordHash, password, ...safe } = u;
      return safe;
    });
    res.json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or activate user account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = store.users.find(u => u.id === req.params.id || u._id === req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isActive = !user.isActive;
    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'suspended'}`,
      data: { id: user.id || user._id, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export financial settlement CSV data
// @route   GET /api/admin/export/financials
// @access  Private/Admin
exports.exportFinancialReport = async (req, res, next) => {
  try {
    const sellerOrders = store.sellerOrders;
    let csv = 'Order Number,Seller ID,Store Name,Gross Amount (INR),Commission (INR),Net Seller Payout (INR),Status,Date\n';
    sellerOrders.forEach(so => {
      csv += `"${so.orderNumber}","${so.sellerId}","${so.storeName}",${so.sellerSubtotal},${so.commissionAmount},${so.netPayout},"${so.status}","${so.createdAt}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`shopsphere-financial-report-${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};
