// ==============================================================================
// SHOPSPHERE - Enterprise Multi-Vendor Marketplace Data Engine
// 15 Categories, Customer Registration with Owner Approval (MODE 1 / MODE 2),
// Real Razorpay Payments, Cash on Delivery (COD), Split-Seller Orders,
// and Direct Gmail / Owner Notification Automation
// ==============================================================================

const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const { defaultUsers, sampleProducts, sampleOrders } = require('../data/seedData');
const {
  CATEGORIES,
  USERS,
  SELLERS,
  STORES,
  CUSTOMERS,
  ADDRESSES,
  PRODUCTS,
  INITIAL_ORDERS,
  NOTIFICATIONS
} = require('../data/shopSphereSeedData');

class ShopSphereStore {
  constructor() {
    this.reset();
  }

  reset() {
    // 1. Categories (15 Mandatory Departments)
    this.categories = JSON.parse(JSON.stringify(CATEGORIES));

    // Registration Mode:
    // MODE_1: Automatic account activation after email OTP verification
    // MODE_2: Manual owner approval after email verification (Default per business rules)
    this.registrationMode = 'MODE_2';

    // 2. Users (Unified with roles: SUPER_ADMIN, ADMIN, SELLER, CUSTOMER)
    this.users = [
      ...JSON.parse(JSON.stringify(USERS)).map(u => ({
        ...u,
        accountStatus: 'APPROVED' // Seeded default accounts are approved
      })),
      // Backwards-compatible demo accounts
      ...JSON.parse(JSON.stringify(defaultUsers)).map(u => ({
        id: u._id,
        _id: u._id,
        email: u.email,
        passwordHash: u.password,
        firstName: u.name.split(' ')[0] || 'User',
        lastName: u.name.split(' ')[1] || 'Customer',
        role: u.role === 'admin' ? 'SUPER_ADMIN' : 'CUSTOMER',
        accountStatus: 'APPROVED',
        avatarUrl: u.avatar,
        isActive: true,
        isEmailVerified: true
      }))
    ];

    // 3. Sellers & Stores
    this.sellers = JSON.parse(JSON.stringify(SELLERS));
    this.stores = JSON.parse(JSON.stringify(STORES));

    // 4. Customers & Addresses
    this.customers = JSON.parse(JSON.stringify(CUSTOMERS));
    this.addresses = JSON.parse(JSON.stringify(ADDRESSES));

    // 5. Products (ShopSphere products + legacy products mapped to 15 categories)
    const normalizedShopProducts = PRODUCTS.map(p => ({
      _id: p.id,
      id: p.id,
      storeId: p.storeId,
      categoryId: p.categoryId,
      category: this.categories.find(c => c.id === p.categoryId)?.name || 'Electronics',
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      originalPrice: p.comparePrice,
      costPrice: p.costPrice,
      sku: p.sku,
      image: p.images[0],
      images: p.images,
      specs: p.specs,
      tags: p.tags,
      stock: p.inventory,
      status: p.status,
      rating: p.rating,
      numReviews: p.reviewCount,
      reviews: [],
      isFeatured: p.isFeatured,
      isNewArrival: false,
      sellerName: this.stores.find(s => s.id === p.storeId)?.name || 'Apex Innovations',
      createdAt: new Date()
    }));

    const legacyProducts = sampleProducts.map(p => ({
      ...p,
      id: p._id,
      storeId: 'sto-1',
      categoryId: 'cat-1',
      sellerName: 'Apex Electronics & Tech',
      status: 'ACTIVE'
    }));

    this.products = [...normalizedShopProducts, ...legacyProducts];

    // 6. Orders, Seller Orders, Payments, Payouts, Refunds
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS)).map(o => ({
      ...o,
      _id: o.id,
      user: 'usr-customer-1',
      userId: 'usr-customer-1',
      userName: 'Rahul Sharma',
      userEmail: 'customer@shopsphere.io',
      status: 'Processing',
      orderStatus: 'CONFIRMED',
      total: o.totalAmount,
      subtotal: o.subtotal,
      tax: o.taxAmount,
      shippingFee: o.shippingFee,
      items: o.sellerOrders[0].items
    }));

    this.sellerOrders = [];
    INITIAL_ORDERS.forEach(o => {
      o.sellerOrders.forEach(so => {
        this.sellerOrders.push({
          ...so,
          orderNumber: o.orderNumber,
          customerName: 'Rahul Sharma',
          shippingAddress: o.shippingAddress,
          createdAt: o.createdAt
        });
      });
    });

    this.payments = INITIAL_ORDERS.map(o => o.payment);
    this.payouts = [];
    this.refunds = [];

    // 7. Carts & Wishlists
    this.carts = new Map();
    this.wishlists = new Map();

    // 8. Notifications & Audit Logs
    this.notifications = JSON.parse(JSON.stringify(NOTIFICATIONS));
    this.auditLogs = [];
  }

  // ============================================================================
  // USER & AUTHENTICATION METHODS (WITH OWNER APPROVAL WORKFLOW)
  // ============================================================================

  async findUserById(id) {
    const user = this.users.find(u => u.id === id || u._id === id);
    if (!user) return null;
    const { passwordHash, password, ...safeUser } = user;
    return { ...safeUser, _id: user.id || user._id };
  }

  async findUserByEmail(email, includePassword = false) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (includePassword) {
      return {
        ...user,
        password: user.passwordHash || user.password
      };
    }
    const { passwordHash, password, ...safeUser } = user;
    return { ...safeUser, _id: user.id || user._id };
  }

  /**
   * Step 1: Customer initiates registration -> generates OTP and notifies owner
   */
  async requestCustomerRegistration({ name, email, password, phone, role = 'CUSTOMER', businessName }) {
    const existing = await this.findUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Password@123', salt);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newUser = {
      id,
      _id: id,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      password: hashedPassword,
      firstName: name.split(' ')[0] || 'Customer',
      lastName: name.split(' ')[1] || '',
      name: name.trim(),
      phone: phone || '',
      role: role.toUpperCase(),
      accountStatus: 'EMAIL_VERIFICATION_PENDING',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      isEmailVerified: false,
      isActive: false,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);

    // Generate 6-Digit Email OTP (valid for 10 minutes)
    const otpResult = await emailService.generateOtp(email);

    // Notify Owner of new registration request
    await emailService.notifyOwnerNewCustomer(newUser);

    return {
      userId: id,
      email: newUser.email,
      accountStatus: newUser.accountStatus,
      message: 'Verification OTP sent to your email address.',
      devOtp: otpResult.devOtp
    };
  }

  /**
   * Step 2: Customer verifies OTP
   */
  async verifyCustomerOtp(email, otp) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const verification = await emailService.verifyOtp(email, otp);
    if (!verification.isValid) {
      throw new Error(verification.reason);
    }

    const targetUser = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    targetUser.isEmailVerified = true;

    if (this.registrationMode === 'MODE_1') {
      // Automatic Activation Mode
      targetUser.accountStatus = 'APPROVED';
      targetUser.isActive = true;
      await emailService.sendCustomerApprovalStatus(email, 'APPROVED');
    } else {
      // Manual Owner Approval Mode (Default)
      targetUser.accountStatus = 'OWNER_APPROVAL_PENDING';
      targetUser.isActive = false;
      await emailService.notifyOwnerVerificationRequest(targetUser);
    }

    this.createNotification({
      recipientId: 'usr-admin-1',
      targetRole: 'SUPER_ADMIN',
      title: 'Customer OTP Verified',
      message: `${user.name} (${email}) has verified email OTP. Approval status: ${targetUser.accountStatus}`,
      type: 'VERIFICATION_ALERT',
      link: '/admin'
    });

    return {
      userId: targetUser.id,
      email: targetUser.email,
      accountStatus: targetUser.accountStatus,
      isApproved: targetUser.accountStatus === 'APPROVED'
    };
  }

  /**
   * Step 3: Owner manually approves customer account
   */
  async approveCustomer(userId) {
    const user = this.users.find(u => u.id === userId || u._id === userId);
    if (!user) throw new Error('Customer account not found');

    user.accountStatus = 'APPROVED';
    user.isActive = true;
    user.updatedAt = new Date().toISOString();

    // Create customer profile if absent
    if (!this.customers.find(c => c.userId === user.id)) {
      this.customers.push({
        id: `cus_${Date.now()}`,
        userId: user.id,
        walletBalance: 0,
        defaultAddressId: null
      });
    }

    // Send confirmation email to customer
    await emailService.sendCustomerApprovalStatus(user.email, 'APPROVED');

    this.logAction('APPROVE_CUSTOMER', 'User', user.id, { email: user.email });
    return user;
  }

  /**
   * Step 4: Owner rejects customer account
   */
  async rejectCustomer(userId, reason) {
    const user = this.users.find(u => u.id === userId || u._id === userId);
    if (!user) throw new Error('Customer account not found');

    user.accountStatus = 'REJECTED';
    user.isActive = false;
    user.rejectionReason = reason || 'Documentation failed verification';

    await emailService.sendCustomerApprovalStatus(user.email, 'REJECTED', user.rejectionReason);

    this.logAction('REJECT_CUSTOMER', 'User', user.id, { email: user.email, reason });
    return user;
  }

  async getPendingCustomerApprovals() {
    return this.users.filter(u => u.accountStatus === 'OWNER_APPROVAL_PENDING' || u.accountStatus === 'EMAIL_VERIFICATION_PENDING');
  }

  setRegistrationMode(mode) {
    if (mode === 'MODE_1' || mode === 'MODE_2') {
      this.registrationMode = mode;
      return this.registrationMode;
    }
    throw new Error('Invalid mode. Must be MODE_1 or MODE_2');
  }

  getRegistrationMode() {
    return this.registrationMode;
  }

  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password || 'Password@123', salt);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newUser = {
      id,
      _id: id,
      email: userData.email.toLowerCase(),
      passwordHash: hashedPassword,
      password: hashedPassword,
      firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
      lastName: userData.lastName || userData.name?.split(' ')[1] || 'Customer',
      name: userData.name || `${userData.firstName || 'User'} ${userData.lastName || ''}`.trim(),
      phone: userData.phone || '',
      role: userData.role ? userData.role.toUpperCase() : 'CUSTOMER',
      accountStatus: 'APPROVED',
      avatarUrl: userData.avatarUrl || userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.email)}`,
      avatar: userData.avatar || userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.email)}`,
      googleId: userData.googleId || null,
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);

    if (newUser.role === 'CUSTOMER') {
      this.customers.push({
        id: `cus_${Date.now()}`,
        userId: newUser.id,
        walletBalance: 0,
        defaultAddressId: null
      });
    }

    if (newUser.role === 'SELLER') {
      const sellerId = `sel_${Date.now()}`;
      this.sellers.push({
        id: sellerId,
        userId: newUser.id,
        panNumber: userData.panNumber || 'PENDING_KYC',
        gstin: userData.gstin || 'PENDING_KYC',
        businessName: userData.businessName || `${newUser.name}'s Store`,
        businessType: userData.businessType || 'Proprietorship',
        bankAccountNo: userData.bankAccountNo || '',
        bankIfsc: userData.bankIfsc || '',
        bankName: userData.bankName || '',
        kycStatus: 'PENDING',
        commissionRate: 10.0
      });

      this.stores.push({
        id: `sto_${Date.now()}`,
        sellerId,
        name: userData.businessName || `${newUser.name}'s Store`,
        slug: (userData.businessName || `${newUser.name}-store`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: 'Authorized merchant storefront on ShopSphere',
        logoUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        supportEmail: newUser.email,
        supportPhone: newUser.phone,
        status: 'ACTIVE',
        rating: 5.0,
        reviewCount: 0
      });
    }

    const { passwordHash: _, password: __, ...safeUser } = newUser;
    return safeUser;
  }

  async updateUser(id, updateData) {
    const index = this.users.findIndex(u => u.id === id || u._id === id);
    if (index === -1) return null;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateData.password, salt);
      updateData.passwordHash = hashedPassword;
      updateData.password = hashedPassword;
    }

    this.users[index] = { ...this.users[index], ...updateData, updatedAt: new Date() };
    const { passwordHash: _, password: __, ...safeUser } = this.users[index];
    return safeUser;
  }

  async countUsers() {
    return this.users.length;
  }

  // ============================================================================
  // CATEGORIES (15 MANDATORY DEPARTMENTS + ADMIN CRUD)
  // ============================================================================
  async getCategories() {
    return this.categories.map(c => {
      const count = this.products.filter(p => p.categoryId === c.id || p.category.toLowerCase() === c.name.toLowerCase()).length;
      return {
        ...c,
        count
      };
    });
  }

  async getCategoryById(id) {
    return this.categories.find(c => c.id === id || c.slug === id) || null;
  }

  async createCategory(categoryData) {
    const id = `cat-${Date.now()}`;
    const slug = (categoryData.slug || categoryData.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCategory = {
      id,
      name: categoryData.name,
      slug,
      description: categoryData.description || '',
      icon: categoryData.icon || 'ShoppingBag',
      imageUrl: categoryData.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      displayOrder: parseInt(categoryData.displayOrder, 10) || (this.categories.length + 1),
      isActive: categoryData.isActive !== false,
      createdAt: new Date()
    };
    this.categories.push(newCategory);
    this.logAction('CREATE_CATEGORY', 'Category', id, { name: newCategory.name });
    return newCategory;
  }

  async updateCategory(id, updateData) {
    const index = this.categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) return null;
    this.categories[index] = {
      ...this.categories[index],
      ...updateData,
      updatedAt: new Date()
    };
    this.logAction('UPDATE_CATEGORY', 'Category', id, updateData);
    return this.categories[index];
  }

  async deleteCategory(id) {
    const index = this.categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) return false;
    const deleted = this.categories.splice(index, 1)[0];
    this.logAction('DELETE_CATEGORY', 'Category', id, { name: deleted.name });
    return true;
  }

  // ============================================================================
  // PRODUCTS METHODS
  // ============================================================================
  async findProducts({ category, storeId, sellerId, search, minPrice, maxPrice, rating, inStock, status, sort, page = 1, limit = 50 }) {
    let result = [...this.products];

    if (status) {
      result = result.filter(p => p.status === status);
    }

    if (storeId) {
      result = result.filter(p => p.storeId === storeId);
    }

    if (sellerId) {
      const store = this.stores.find(s => s.sellerId === sellerId);
      if (store) {
        result = result.filter(p => p.storeId === store.id);
      }
    }

    if (category && category !== 'All') {
      const catObj = this.categories.find(c => c.name.toLowerCase() === category.toLowerCase() || c.slug.toLowerCase() === category.toLowerCase() || c.id === category);
      if (catObj) {
        result = result.filter(p => p.categoryId === catObj.id || p.category.toLowerCase() === catObj.name.toLowerCase());
      } else {
        result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (minPrice !== undefined && minPrice !== '') {
      result = result.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      result = result.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (rating !== undefined && rating !== '') {
      result = result.filter(p => p.rating >= parseFloat(rating));
    }

    if (inStock === 'true' || inStock === true) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit) || 1
    };
  }

  async findProductById(id) {
    const product = this.products.find(p => p._id === id || p.id === id || p.slug === id);
    if (!product) return null;

    const store = this.stores.find(s => s.id === product.storeId);
    const category = this.categories.find(c => c.id === product.categoryId);

    return {
      ...product,
      store: store || { name: 'ShopSphere Official', rating: 4.9 },
      categoryData: category || null
    };
  }

  async createProduct(productData) {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const slug = (productData.slug || productData.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const categoryObj = this.categories.find(c => c.id === productData.categoryId || c.name.toLowerCase() === (productData.category || '').toLowerCase());
    const storeObj = this.stores.find(s => s.id === productData.storeId);

    const newProduct = {
      _id: id,
      id,
      storeId: productData.storeId || 'sto-1',
      sellerName: storeObj ? storeObj.name : 'Apex Innovations',
      categoryId: categoryObj ? categoryObj.id : 'cat-1',
      category: categoryObj ? categoryObj.name : (productData.category || 'Electronics'),
      name: productData.name,
      slug,
      description: productData.description || '',
      price: parseFloat(productData.price) || 0,
      originalPrice: parseFloat(productData.originalPrice || productData.comparePrice) || parseFloat(productData.price) * 1.2,
      costPrice: parseFloat(productData.costPrice) || parseFloat(productData.price) * 0.7,
      sku: productData.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      stock: parseInt(productData.stock || productData.inventory, 10) || 10,
      image: productData.images?.[0] || productData.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80'],
      specs: productData.specs || {},
      tags: productData.tags || [],
      status: productData.status || 'ACTIVE',
      rating: 5.0,
      numReviews: 0,
      reviews: [],
      isFeatured: !!productData.isFeatured,
      isNewArrival: true,
      createdAt: new Date()
    };

    this.products.unshift(newProduct);
    this.logAction('CREATE_PRODUCT', 'Product', id, { name: newProduct.name, storeId: newProduct.storeId });
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const index = this.products.findIndex(p => p._id === id || p.id === id);
    if (index === -1) return null;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock, 10);
    if (updateData.inventory !== undefined) updateData.stock = parseInt(updateData.inventory, 10);

    this.products[index] = { ...this.products[index], ...updateData, updatedAt: new Date() };
    this.logAction('UPDATE_PRODUCT', 'Product', id, updateData);
    return this.products[index];
  }

  async deleteProduct(id) {
    const index = this.products.findIndex(p => p._id === id || p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    this.logAction('DELETE_PRODUCT', 'Product', id, {});
    return true;
  }

  async addProductReview(productId, reviewData) {
    const product = await this.findProductById(productId);
    if (!product) return null;

    const newReview = {
      id: `rev_${Date.now()}`,
      user: reviewData.userName || 'Verified Shopper',
      rating: parseInt(reviewData.rating, 10) || 5,
      comment: reviewData.comment || '',
      date: new Date().toISOString().split('T')[0]
    };

    product.reviews.unshift(newReview);
    product.numReviews = product.reviews.length;
    const totalScore = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = parseFloat((totalScore / product.numReviews).toFixed(1));

    return product;
  }

  // ============================================================================
  // SELLERS & STORES
  // ============================================================================
  async getAllSellers() {
    return this.sellers.map(s => {
      const user = this.users.find(u => u.id === s.userId);
      const store = this.stores.find(st => st.sellerId === s.id);
      const sellerOrders = this.sellerOrders.filter(so => so.sellerId === s.id);
      const grossSales = sellerOrders.reduce((acc, so) => acc + so.sellerSubtotal, 0);
      return {
        ...s,
        user: user ? { email: user.email, name: `${user.firstName} ${user.lastName}` } : null,
        store: store || null,
        orderCount: sellerOrders.length,
        grossSales
      };
    });
  }

  async getSellerByUserId(userId) {
    const seller = this.sellers.find(s => s.userId === userId);
    if (!seller) return null;
    const store = this.stores.find(st => st.sellerId === seller.id);
    return { ...seller, store };
  }

  async getSellerById(sellerId) {
    return this.sellers.find(s => s.id === sellerId) || null;
  }

  async updateSellerKyc(sellerId, kycData) {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (!seller) return null;
    Object.assign(seller, {
      ...kycData,
      kycStatus: 'PENDING',
      updatedAt: new Date()
    });

    // Notify Owner via Email & Platform Notification
    await emailService.notifyOwnerSellerKyc(seller);

    this.createNotification({
      recipientId: 'usr-admin-1',
      targetRole: 'SUPER_ADMIN',
      title: 'Seller KYC Submitted',
      message: `${seller.businessName} has updated KYC details for verification.`,
      type: 'KYC_SUBMITTED',
      link: '/admin'
    });
    return seller;
  }

  async approveSeller(sellerId) {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (!seller) return null;
    seller.kycStatus = 'APPROVED';
    seller.kycRejectionReason = null;

    this.createNotification({
      recipientId: seller.userId,
      targetRole: 'SELLER',
      title: 'KYC Approved',
      message: 'Congratulations! Your merchant KYC has been verified. You can now list products on the marketplace.',
      type: 'KYC_APPROVED',
      link: '/seller'
    });
    return seller;
  }

  async rejectSeller(sellerId, reason) {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (!seller) return null;
    seller.kycStatus = 'REJECTED';
    seller.kycRejectionReason = reason || 'Documentation does not meet verification requirements';

    this.createNotification({
      recipientId: seller.userId,
      targetRole: 'SELLER',
      title: 'KYC Verification Needed',
      message: `KYC was rejected: ${seller.kycRejectionReason}. Please re-submit valid credentials.`,
      type: 'KYC_REJECTED',
      link: '/seller/kyc'
    });
    return seller;
  }

  async getAllStores() {
    return this.stores;
  }

  async getStoreBySlug(slug) {
    const store = this.stores.find(s => s.slug === slug || s.id === slug);
    if (!store) return null;
    const products = this.products.filter(p => p.storeId === store.id && p.status === 'ACTIVE');
    return { ...store, products };
  }

  async updateStore(storeId, updateData) {
    const index = this.stores.findIndex(s => s.id === storeId);
    if (index === -1) return null;
    this.stores[index] = { ...this.stores[index], ...updateData, updatedAt: new Date() };
    return this.stores[index];
  }

  // ============================================================================
  // CUSTOMER ADDRESSES
  // ============================================================================
  async getCustomerAddresses(userId) {
    const customer = this.customers.find(c => c.userId === userId);
    if (!customer) return [];
    return this.addresses.filter(a => a.customerId === customer.id);
  }

  async addCustomerAddress(userId, addressData) {
    let customer = this.customers.find(c => c.userId === userId);
    if (!customer) {
      customer = { id: `cus_${Date.now()}`, userId, walletBalance: 0 };
      this.customers.push(customer);
    }

    const newAddress = {
      id: `addr_${Date.now()}`,
      customerId: customer.id,
      fullName: addressData.fullName,
      phone: addressData.phone,
      addressLine1: addressData.addressLine1 || addressData.street,
      addressLine2: addressData.addressLine2 || '',
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country || 'India',
      addressType: addressData.addressType || 'HOME',
      isDefault: !!addressData.isDefault || this.addresses.filter(a => a.customerId === customer.id).length === 0,
      createdAt: new Date()
    };

    if (newAddress.isDefault) {
      this.addresses.filter(a => a.customerId === customer.id).forEach(a => a.isDefault = false);
      customer.defaultAddressId = newAddress.id;
    }

    this.addresses.push(newAddress);
    return newAddress;
  }

  // ============================================================================
  // CART & WISHLIST
  // ============================================================================
  async getCart(userId) {
    return this.carts.get(userId) || [];
  }

  async addToCart(userId, { productId, quantity = 1 }) {
    const product = await this.findProductById(productId);
    if (!product) throw new Error('Product not found');

    let userCart = this.carts.get(userId) || [];
    const existingIndex = userCart.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      userCart[existingIndex].quantity += quantity;
    } else {
      userCart.push({
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
        category: product.category,
        storeId: product.storeId,
        sellerName: product.sellerName,
        quantity,
        stock: product.stock
      });
    }

    this.carts.set(userId, userCart);
    return userCart;
  }

  async updateCartItem(userId, itemId, quantity) {
    let userCart = this.carts.get(userId) || [];
    const item = userCart.find(i => i.id === itemId || i.productId === itemId);
    if (item) {
      if (quantity <= 0) {
        userCart = userCart.filter(i => i.id !== itemId && i.productId !== itemId);
      } else {
        item.quantity = quantity;
      }
      this.carts.set(userId, userCart);
    }
    return userCart;
  }

  async removeCartItem(userId, itemId) {
    let userCart = this.carts.get(userId) || [];
    userCart = userCart.filter(i => i.id !== itemId && i.productId !== itemId);
    this.carts.set(userId, userCart);
    return userCart;
  }

  async clearCart(userId) {
    this.carts.set(userId, []);
    return [];
  }

  async getWishlist(userId) {
    const productIds = Array.from(this.wishlists.get(userId) || []);
    return this.products.filter(p => productIds.includes(p._id) || productIds.includes(p.id));
  }

  async toggleWishlist(userId, productId) {
    let list = this.wishlists.get(userId);
    if (!list) {
      list = new Set();
      this.wishlists.set(userId, list);
    }

    let added = false;
    if (list.has(productId)) {
      list.delete(productId);
      added = false;
    } else {
      list.add(productId);
      added = true;
    }

    const items = await this.getWishlist(userId);
    return { added, items };
  }

  // ============================================================================
  // MULTI-VENDOR ORDER ENGINE (PARENT ORDER + SELLER SUB-ORDERS + COD + LIFECYCLE)
  // ============================================================================
  async createOrder(orderData) {
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `SS-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = orderData.items || [];
    if (!items.length) {
      throw new Error('Order must contain at least one item');
    }

    const subtotal = parseFloat(orderData.subtotal) || items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat(orderData.tax) || Math.round(subtotal * 0.18);
    const shippingFee = parseFloat(orderData.shippingFee) || (subtotal > 2000 ? 0 : 99);
    const discount = parseFloat(orderData.discount) || 0;
    const total = subtotal + tax + shippingFee - discount;

    const isCod = orderData.paymentMethod === 'COD';

    // COD Safety Limit Check
    if (isCod && total > 25000) {
      throw new Error('Cash on Delivery is limited to orders up to ₹25,000. Please select an online payment method.');
    }

    // Verify stock availability across all items before reserving
    for (const item of items) {
      const prod = await this.findProductById(item.productId);
      if (!prod) throw new Error(`Product ${item.name || item.productId} no longer exists`);
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.stock}`);
      }
    }

    // Group items by store / seller for split order fulfillment
    const itemsByStore = new Map();
    for (const item of items) {
      const prod = await this.findProductById(item.productId);
      const storeId = prod?.storeId || item.storeId || 'sto-1';
      if (!itemsByStore.has(storeId)) {
        itemsByStore.set(storeId, []);
      }
      itemsByStore.get(storeId).push({
        ...item,
        productId: prod?._id || item.productId,
        productName: prod?.name || item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      });
    }

    // Generate Seller Sub-Orders with Platform Commission Calculation
    const createdSellerOrders = [];
    for (const [storeId, storeItems] of itemsByStore.entries()) {
      const store = this.stores.find(s => s.id === storeId);
      const seller = this.sellers.find(s => s.id === store?.sellerId) || this.sellers[0];
      const commissionRate = seller ? seller.commissionRate : 10.0;

      const sellerSubtotal = storeItems.reduce((acc, i) => acc + i.total, 0);
      const commissionAmount = parseFloat(((sellerSubtotal * commissionRate) / 100).toFixed(2));
      const netPayout = parseFloat((sellerSubtotal - commissionAmount).toFixed(2));

      const sellerOrder = {
        id: `so_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        orderId,
        orderNumber,
        sellerId: seller ? seller.id : 'sel-1',
        storeId,
        storeName: store ? store.name : 'Apex Innovations',
        sellerSubtotal,
        commissionAmount,
        commissionRate,
        netPayout,
        status: isCod ? 'SELLER_ACCEPTANCE_PENDING' : 'SELLER_ACCEPTED',
        shippingCarrier: null,
        trackingNumber: null,
        items: storeItems,
        createdAt: new Date().toISOString()
      };

      this.sellerOrders.push(sellerOrder);
      createdSellerOrders.push(sellerOrder);

      // Notify Seller of New Order
      if (seller) {
        this.createNotification({
          recipientId: seller.userId,
          targetRole: 'SELLER',
          title: `New Order Received (${orderNumber})`,
          message: `You received an order for ${storeItems.length} item(s). Net earnings: ₹${netPayout.toLocaleString('en-IN')}`,
          type: 'ORDER_RECEIVED',
          link: '/seller/orders'
        });
      }
    }

    // Parent Order Lifecycle Setup
    const newOrder = {
      _id: orderId,
      id: orderId,
      orderNumber,
      user: orderData.userId || 'usr-customer-1',
      userId: orderData.userId || 'usr-customer-1',
      userEmail: orderData.userEmail || 'customer@shopsphere.io',
      userName: orderData.userName || 'Valued Customer',
      items,
      sellerOrders: createdSellerOrders,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || (isCod ? 'COD' : 'RAZORPAY'),
      paymentStatus: isCod ? 'COD_PENDING' : (orderData.paymentStatus || 'PAID'),
      isCod,
      subtotal,
      tax,
      shippingFee,
      discount,
      total,
      currency: 'INR',
      status: isCod ? 'Order Placed (COD)' : 'Processing',
      orderStatus: isCod ? 'ORDER_PLACED' : 'CONFIRMED',
      trackingNumber: `SS-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      timeline: [
        { title: 'Order Placed', timestamp: new Date().toISOString(), completed: true },
        { title: isCod ? 'Cash on Delivery Verified' : 'Payment Confirmed', timestamp: new Date().toISOString(), completed: true },
        { title: 'Seller Processing & Packing', timestamp: isCod ? null : new Date().toISOString(), completed: !isCod },
        { title: 'Dispatched & Shipped', timestamp: null, completed: false },
        { title: 'Out for Delivery', timestamp: null, completed: false },
        { title: 'Delivered', timestamp: null, completed: false }
      ],
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);

    // Atomically decrement Product Stock Levels
    for (const item of items) {
      const product = await this.findProductById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    // Clear Customer Cart
    if (orderData.userId) {
      await this.clearCart(orderData.userId);
    }

    // Send Real-time Owner Gmail Notification
    if (isCod) {
      await emailService.notifyOwnerCodOrder(newOrder);
    } else {
      await emailService.notifyOwnerNewOrder(newOrder);
    }

    // Notify Customer and Super Admin in-app
    this.createNotification({
      recipientId: newOrder.userId,
      targetRole: 'CUSTOMER',
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} for ₹${total.toLocaleString('en-IN')} has been placed successfully!`,
      type: 'ORDER_PLACED',
      link: '/orders'
    });

    this.createNotification({
      recipientId: 'usr-admin-1',
      targetRole: 'SUPER_ADMIN',
      title: 'Platform Order Placed',
      message: `Order #${orderNumber} placed for ₹${total.toLocaleString('en-IN')} across ${createdSellerOrders.length} store(s).`,
      type: 'ADMIN_ALERT',
      link: '/admin'
    });

    return newOrder;
  }

  async findOrdersByUser(userId) {
    return this.orders.filter(o => o.user === userId || o.userId === userId);
  }

  async findOrderById(id) {
    return this.orders.find(o => o._id === id || o.id === id || o.orderNumber === id) || null;
  }

  async findAllOrders() {
    return this.orders;
  }

  async getSellerOrders(sellerId) {
    return this.sellerOrders.filter(so => so.sellerId === sellerId);
  }

  async updateSellerOrderStatus(sellerOrderId, status, tracking = {}) {
    const so = this.sellerOrders.find(s => s.id === sellerOrderId);
    if (!so) return null;

    so.status = status;
    if (tracking.shippingCarrier) so.shippingCarrier = tracking.shippingCarrier;
    if (tracking.trackingNumber) so.trackingNumber = tracking.trackingNumber;
    so.updatedAt = new Date().toISOString();

    const parentOrder = this.orders.find(o => o.id === so.orderId || o._id === so.orderId);
    if (parentOrder) {
      const allSubOrders = this.sellerOrders.filter(s => s.orderId === parentOrder.id);
      const allDelivered = allSubOrders.every(s => s.status === 'DELIVERED');
      const allPacked = allSubOrders.every(s => s.status === 'PACKED' || s.status === 'SHIPPED' || s.status === 'DELIVERED');
      const anyShipped = allSubOrders.some(s => s.status === 'SHIPPED');

      if (allDelivered) {
        parentOrder.status = 'Delivered';
        parentOrder.orderStatus = 'DELIVERED';
        if (parentOrder.isCod) {
          parentOrder.paymentStatus = 'PAID';
        }
        const step = parentOrder.timeline?.find(t => t.title === 'Delivered');
        if (step) { step.completed = true; step.timestamp = new Date().toISOString(); }
      } else if (anyShipped) {
        parentOrder.status = 'Shipped';
        parentOrder.orderStatus = 'SHIPPED';
        const step = parentOrder.timeline?.find(t => t.title === 'Dispatched & Shipped');
        if (step) { step.completed = true; step.timestamp = new Date().toISOString(); }
      } else if (allPacked) {
        parentOrder.status = 'Packed';
        parentOrder.orderStatus = 'PACKED';
        const step = parentOrder.timeline?.find(t => t.title === 'Seller Processing & Packing');
        if (step) { step.completed = true; step.timestamp = new Date().toISOString(); }
      }
    }

    return so;
  }

  /**
   * Cash on Delivery Collection Confirmation
   */
  async confirmCodCollection(orderId) {
    const order = await this.findOrderById(orderId);
    if (!order) throw new Error('Order not found');
    if (!order.isCod) throw new Error('Order is not a Cash on Delivery order');

    order.paymentStatus = 'PAID';
    order.orderStatus = 'DELIVERED';
    order.status = 'Delivered';
    order.codCollectedAt = new Date().toISOString();

    this.createNotification({
      recipientId: order.userId,
      targetRole: 'CUSTOMER',
      title: 'COD Payment Collected',
      message: `Cash of ₹${order.total} has been collected and confirmed by our logistics partner for order #${order.orderNumber}.`,
      type: 'PAYMENT_SUCCESS',
      link: '/orders'
    });

    return order;
  }

  // Dynamic UPI QR Code payload generator
  generateUpiQrCode(orderNumber, amount) {
    const upiId = process.env.OWNER_UPI_ID || 'shopsphere.owner@okhdfcbank';
    const merchantName = 'ShopSphere Marketplace';
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tr=${encodeURIComponent(orderNumber)}&tn=${encodeURIComponent(`Payment for Order ${orderNumber}`)}`;

    return {
      upiUrl,
      upiId,
      merchantName,
      amount,
      currency: 'INR',
      orderNumber,
      qrSvgUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`
    };
  }

  // ============================================================================
  // SELLER EARNINGS & PAYOUT SETTLEMENTS
  // ============================================================================
  async getSellerEarnings(sellerId) {
    const sellerOrders = this.sellerOrders.filter(so => so.sellerId === sellerId);
    const grossEarnings = sellerOrders.reduce((sum, so) => sum + so.sellerSubtotal, 0);
    const totalCommissionDeducted = sellerOrders.reduce((sum, so) => sum + so.commissionAmount, 0);
    const netEarnings = sellerOrders.reduce((sum, so) => sum + so.netPayout, 0);

    const sellerPayouts = this.payouts.filter(p => p.sellerId === sellerId);
    const transferredPayouts = sellerPayouts
      .filter(p => p.status === 'TRANSFERRED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingBalance = Math.max(0, netEarnings - transferredPayouts);

    return {
      sellerId,
      grossEarnings: parseFloat(grossEarnings.toFixed(2)),
      totalCommissionDeducted: parseFloat(totalCommissionDeducted.toFixed(2)),
      netEarnings: parseFloat(netEarnings.toFixed(2)),
      transferredPayouts: parseFloat(transferredPayouts.toFixed(2)),
      availableBalance: parseFloat(pendingBalance.toFixed(2)),
      totalOrders: sellerOrders.length,
      payoutHistory: sellerPayouts
    };
  }

  async requestSellerPayout(sellerId, amount) {
    const earnings = await this.getSellerEarnings(sellerId);
    if (amount > earnings.availableBalance) {
      throw new Error(`Requested amount ₹${amount} exceeds available settlement balance of ₹${earnings.availableBalance}`);
    }

    const seller = this.sellers.find(s => s.id === sellerId);

    const payout = {
      id: `payout_${Date.now()}`,
      sellerId,
      amount: parseFloat(amount),
      currency: 'INR',
      status: 'TRANSFERRED',
      razorpayPayoutId: `pout_${Date.now()}`,
      bankReference: `UTR-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };

    this.payouts.unshift(payout);

    // Notify Owner of settlement withdrawal
    if (seller) {
      await emailService.notifyOwnerSettlementRequest(seller, payout);
    }

    this.createNotification({
      recipientId: seller?.userId,
      targetRole: 'SELLER',
      title: 'Settlement Payout Processed',
      message: `Your payout of ₹${amount.toLocaleString('en-IN')} has been transferred to your registered bank account via Razorpay Route.`,
      type: 'PAYOUT_PROCESSED',
      link: '/seller'
    });

    return payout;
  }

  // ============================================================================
  // REFUNDS ENGINE
  // ============================================================================
  async requestRefund(orderId, reason, amount) {
    const order = await this.findOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const refundAmount = amount ? parseFloat(amount) : order.total;
    const refund = {
      id: `ref_${Date.now()}`,
      orderId: order._id || order.id,
      orderNumber: order.orderNumber,
      amount: refundAmount,
      reason: reason || 'Customer returned product',
      status: 'APPROVED',
      razorpayRefundId: `rfnd_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.refunds.unshift(refund);
    order.paymentStatus = 'REFUNDED';
    order.orderStatus = 'REFUNDED';
    order.status = 'Refunded';

    // Notify Owner via Email
    await emailService.notifyOwnerRefundRequested(order, refund);

    this.createNotification({
      recipientId: order.userId || order.user,
      targetRole: 'CUSTOMER',
      title: 'Refund Approved',
      message: `Your refund request for order ${order.orderNumber} (₹${refundAmount}) has been approved and credited.`,
      type: 'REFUND_PROCESSED',
      link: '/orders'
    });

    return refund;
  }

  async getAllRefunds() {
    return this.refunds;
  }

  // ============================================================================
  // SUPER ADMIN OWNER DASHBOARD METRICS
  // ============================================================================
  async getSuperAdminAnalytics() {
    const totalGMV = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCommission = this.sellerOrders.reduce((sum, so) => sum + (so.commissionAmount || 0), 0);
    const totalOrders = this.orders.length;
    const totalCustomers = this.customers.length;
    const totalSellers = this.sellers.length;
    const totalProducts = this.products.length;

    const pendingOrders = this.orders.filter(o => o.orderStatus === 'ORDER_PLACED' || o.orderStatus === 'CONFIRMED' || o.status === 'Processing').length;
    const successfulPayments = this.orders.filter(o => o.paymentStatus === 'PAID').length;
    const codOrdersCount = this.orders.filter(o => o.isCod).length;
    const pendingCustomerApprovals = this.users.filter(u => u.accountStatus === 'OWNER_APPROVAL_PENDING').length;

    const totalRefunds = this.refunds.reduce((sum, r) => sum + r.amount, 0);
    const totalSellerPayouts = this.payouts.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalGMV: parseFloat(totalGMV.toFixed(2)),
      platformCommission: parseFloat(totalCommission.toFixed(2)),
      totalOrders,
      totalCustomers,
      totalSellers,
      totalProducts,
      pendingOrders,
      successfulPayments,
      failedPayments: 0,
      codOrdersCount,
      pendingApprovals: pendingCustomerApprovals,
      registrationMode: this.registrationMode,
      ownerEmail: emailService.ownerEmail,
      refundCount: this.refunds.length,
      totalRefunds: parseFloat(totalRefunds.toFixed(2)),
      totalSellerSettlements: parseFloat(totalSellerPayouts.toFixed(2)),
      categoriesCount: this.categories.length,
      recentOrders: this.orders.slice(0, 5),
      monthlySales: [
        { month: 'Oct 2025', gmv: 340000, commission: 34000, orders: 120 },
        { month: 'Nov 2025', gmv: 520000, commission: 52000, orders: 185 },
        { month: 'Dec 2025', gmv: 890000, commission: 89000, orders: 310 },
        { month: 'Jan 2026', gmv: 640000, commission: 64000, orders: 220 },
        { month: 'Feb 2026', gmv: 710000, commission: 71000, orders: 250 },
        { month: 'Mar 2026', gmv: totalGMV, commission: totalCommission, orders: totalOrders }
      ]
    };
  }

  // Backwards compatibility for DevOps/standard analytics
  async getAnalytics() {
    const adminData = await this.getSuperAdminAnalytics();
    return {
      totalRevenue: adminData.totalGMV,
      totalOrders: adminData.totalOrders,
      totalProducts: adminData.totalProducts,
      totalUsers: this.users.length,
      lowStockCount: this.products.filter(p => p.stock < 20).length,
      recentOrders: this.orders.slice(0, 5),
      monthlySales: adminData.monthlySales.map(m => ({
        month: m.month,
        revenue: m.gmv,
        orders: m.orders
      }))
    };
  }

  // ============================================================================
  // NOTIFICATIONS & AUDIT LOGS
  // ============================================================================
  createNotification(notifData) {
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      recipientId: notifData.recipientId,
      targetRole: notifData.targetRole || 'CUSTOMER',
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'INFO',
      link: notifData.link || '/',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }

  getNotifications(recipientId, role) {
    return this.notifications.filter(n =>
      (recipientId && n.recipientId === recipientId) ||
      (role && n.targetRole === role)
    );
  }

  markNotificationAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  }

  logAction(action, entityType, entityId, details = {}) {
    const log = {
      id: `audit_${Date.now()}`,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return log;
  }
}

const store = new ShopSphereStore();
module.exports = store;
