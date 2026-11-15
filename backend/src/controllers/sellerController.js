// ==============================================================================
// SHOPSPHERE - Seller Portal Controller
// KYC Verification, Store Management, Product Listings, Order Fulfillment & Payouts
// ==============================================================================

const store = require('../models/store');

// Middleware helper to get seller record from logged in user
const getSellerRecord = async (userId) => {
  let seller = await store.getSellerByUserId(userId);
  if (!seller) {
    // If user is a seller but seller profile not found, auto-initialize
    const user = await store.findUserById(userId);
    const sellerId = `sel_${Date.now()}`;
    seller = {
      id: sellerId,
      userId,
      panNumber: 'PENDING',
      gstin: 'PENDING',
      businessName: `${user.firstName || 'Merchant'}'s Store`,
      businessType: 'Proprietorship',
      bankAccountNo: '',
      bankIfsc: '',
      bankName: '',
      kycStatus: 'PENDING',
      commissionRate: 10.0
    };
    store.sellers.push(seller);

    const newStore = {
      id: `sto_${Date.now()}`,
      sellerId,
      name: `${user.firstName || 'Merchant'} Store`,
      slug: `${(user.firstName || 'merchant').toLowerCase()}-store`,
      description: 'Verified merchant storefront on ShopSphere',
      logoUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=200&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      supportEmail: user.email,
      supportPhone: '+91 98765 43210',
      status: 'ACTIVE',
      rating: 5.0,
      reviewCount: 0
    };
    store.stores.push(newStore);
    seller.store = newStore;
  }
  return seller;
};

// @desc    Get Seller Profile & Store Info
// @route   GET /api/seller/profile
// @access  Private (Seller/Admin)
exports.getSellerProfile = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit or update Seller KYC details
// @route   POST /api/seller/kyc
// @access  Private (Seller)
exports.submitSellerKyc = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    const { panNumber, gstin, businessName, businessType, bankAccountNo, bankIfsc, bankName } = req.body;

    if (!panNumber || !gstin || !bankAccountNo || !bankIfsc) {
      return res.status(400).json({
        success: false,
        message: 'PAN Number, GSTIN, Bank Account Number, and IFSC Code are mandatory for KYC verification'
      });
    }

    const updated = await store.updateSellerKyc(seller.id, {
      panNumber: panNumber.toUpperCase(),
      gstin: gstin.toUpperCase(),
      businessName: businessName || seller.businessName,
      businessType: businessType || seller.businessType,
      bankAccountNo,
      bankIfsc: bankIfsc.toUpperCase(),
      bankName: bankName || 'Bank of India'
    });

    res.json({
      success: true,
      message: 'KYC submitted successfully. Super Admin verification is in progress.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Store Branding & Information
// @route   PUT /api/seller/store
// @access  Private (Seller)
exports.updateStoreProfile = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    if (!seller.store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const updatedStore = await store.updateStore(seller.store.id, req.body);
    res.json({
      success: true,
      message: 'Store profile updated successfully',
      data: updatedStore
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products belonging to this seller
// @route   GET /api/seller/products
// @access  Private (Seller)
exports.getSellerProducts = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    const products = await store.findProducts({ sellerId: seller.id, limit: 100 });
    res.json({
      success: true,
      count: products.total,
      data: products.products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new product under seller store
// @route   POST /api/seller/products
// @access  Private (Seller)
exports.createSellerProduct = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    const { name, categoryId, category, price, comparePrice, costPrice, stock, description, image, images, specs, tags } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Product name and price are required' });
    }

    const newProduct = await store.createProduct({
      storeId: seller.store?.id || 'sto-1',
      name,
      categoryId,
      category,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      stock: parseInt(stock, 10) || 10,
      description,
      image,
      images,
      specs,
      tags,
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update seller product
// @route   PUT /api/seller/products/:id
// @access  Private (Seller)
exports.updateSellerProduct = async (req, res, next) => {
  try {
    const updated = await store.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete seller product
// @route   DELETE /api/seller/products/:id
// @access  Private (Seller)
exports.deleteSellerProduct = async (req, res, next) => {
  try {
    const deleted = await store.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product removed from store'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders allocated to this seller
// @route   GET /api/seller/orders
// @access  Private (Seller)
exports.getSellerOrders = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    const orders = await store.getSellerOrders(seller.id);
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status of a seller sub-order (Accept, Ship, Deliver)
// @route   PUT /api/seller/orders/:id/status
// @access  Private (Seller)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, shippingCarrier, trackingNumber } = req.body;
    const updated = await store.updateSellerOrderStatus(req.params.id, status, {
      shippingCarrier,
      trackingNumber
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Seller order not found' });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller earnings, platform commission deducted, and payout balance
// @route   GET /api/seller/earnings
// @access  Private (Seller)
exports.getSellerEarnings = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    const earnings = await store.getSellerEarnings(seller.id);
    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request settlement payout to bank account
// @route   POST /api/seller/payouts
// @access  Private (Seller)
exports.requestPayout = async (req, res, next) => {
  try {
    const seller = await getSellerRecord(req.user.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payout amount is required' });
    }

    const payout = await store.requestSellerPayout(seller.id, parseFloat(amount));
    res.status(201).json({
      success: true,
      message: 'Settlement payout processed successfully via Razorpay Route',
      data: payout
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get Public Storefront and its products by store slug
// @route   GET /api/seller/store/:slug
// @access  Public
exports.getPublicStoreBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const storeObj = store.stores.find(s => s.slug === slug || s.id === slug);
    if (!storeObj) {
      return res.status(404).json({ success: false, message: 'Storefront not found' });
    }
    const seller = store.sellers.find(sel => sel.id === storeObj.sellerId);
    const products = store.products.filter(p => p.sellerId === storeObj.sellerId);
    res.json({
      success: true,
      data: {
        store: storeObj,
        seller: seller ? {
          businessName: seller.businessName,
          kycStatus: seller.kycStatus,
          businessType: seller.businessType
        } : null,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};


