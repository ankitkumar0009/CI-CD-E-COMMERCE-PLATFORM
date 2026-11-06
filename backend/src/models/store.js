// ==============================================================================
// SHOPSPHERE - Enterprise Multi-Vendor In-Memory & Database Data Engine
// Supports 14 Categories, Sellers, Stores, Multi-Address Customers,
// Split Multi-Vendor Orders, Razorpay Payments, Payouts, Refunds & Notifications
// ==============================================================================

const bcrypt = require('bcryptjs');
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
    // 1. Categories (14 Mandatory Categories)
    this.categories = JSON.parse(JSON.stringify(CATEGORIES));

    // 2. Users (Unified with roles: SUPER_ADMIN, ADMIN, SELLER, CUSTOMER)
    this.users = [
      ...JSON.parse(JSON.stringify(USERS)),
      // Maintain backwards compatibility with previous test users
      ...JSON.parse(JSON.stringify(defaultUsers)).map(u => ({
        id: u._id,
        _id: u._id,
        email: u.email,
        passwordHash: u.password,
        firstName: u.name.split(' ')[0] || 'User',
        lastName: u.name.split(' ')[1] || 'Customer',
        role: u.role === 'admin' ? 'SUPER_ADMIN' : 'CUSTOMER',
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

    // 5. Products (ShopSphere products + legacy products mapped to 14 categories)
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
      sellerName: this.stores.find(s => s.id === p.storeId)?.name || 'ShopSphere Direct',
      createdAt: new Date()
    }));

    // Backwards-compatible sample products
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
      status: o.orderStatus === 'CONFIRMED' ? 'Processing' : o.orderStatus,
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
  // USER & AUTH METHODS
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
      lastName: userData.lastName || userData.name?.split(' ')[1] || 'Name',
      name: userData.name || `${userData.firstName || 'User'} ${userData.lastName || ''}`.trim(),
      phone: userData.phone || '',
      role: userData.role ? userData.role.toUpperCase() : 'CUSTOMER',
      avatarUrl: userData.avatarUrl || userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.email)}`,
      avatar: userData.avatar || userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.email)}`,
      googleId: userData.googleId || null,
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date()
    };

    this.users.push(newUser);

    // If role is CUSTOMER, create customer profile
    if (newUser.role === 'CUSTOMER' || newUser.role === 'USER') {
      this.customers.push({
        id: `cus_${Date.now()}`,
        userId: newUser.id,
        walletBalance: 0,
        defaultAddressId: null
      });
    }

    // If role is SELLER, create preliminary seller profile
    if (newUser.role === 'SELLER') {
      const sellerId = `sel_${Date.now()}`;
      this.sellers.push({
        id: sellerId,
        userId: newUser.id,
        panNumber: userData.panNumber || 'PENDING',
        gstin: userData.gstin || 'PENDING',
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
        description: 'New merchant on ShopSphere Marketplace',
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
  // CATEGORIES (14 MANDATORY CATEGORIES + ADMIN CRUD)
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
  // PRODUCTS METHODS (MULTI-VENDOR & COMPATIBILITY)
  // ============================================================================
  async findProducts({ category, storeId, sellerId, search, minPrice, maxPrice, rating, inStock, status, sort, page = 1, limit = 50 }) {
    let result = [...this.products];

    // Only active products for general storefront unless status is explicitly requested (e.g. by seller/admin)
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

    // Attach store and category metadata
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
      sellerName: storeObj ? storeObj.name : 'Apex Electronics & Tech',
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
      user: reviewData.userName || 'Verified Customer',
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
    this.createNotification({
      recipientId: 'usr-admin-1',
      targetRole: 'SUPER_ADMIN',
      title: 'Seller KYC Submitted',
      message: `${seller.businessName} has updated KYC details for verification.`,
      type: 'KYC_SUBMITTED',
      link: '/admin/sellers'
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
      message: 'Congratulations! Your seller KYC has been verified. You can now list products.',
      type: 'KYC_APPROVED',
      link: '/seller'
    });
    return seller;
  }

  async rejectSeller(sellerId, reason) {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (!seller) return null;
    seller.kycStatus = 'REJECTED';
    seller.kycRejectionReason = reason || 'Documentation does not meet compliance standards';
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
      addressLine1: addressData.addressLine1,
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
  // MULTI-VENDOR ORDER ENGINE (PARENT ORDER + SELLER SUB-ORDERS)
  // ============================================================================
  async createOrder(orderData) {
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `SS-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = orderData.items || [];
    const subtotal = parseFloat(orderData.subtotal) || items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat(orderData.tax) || Math.round(subtotal * 0.18);
    const shippingFee = parseFloat(orderData.shippingFee) || (subtotal > 2000 ? 0 : 99);
    const discount = parseFloat(orderData.discount) || 0;
    const total = subtotal + tax + shippingFee - discount;

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
        storeName: store ? store.name : 'Apex Electronics',
        sellerSubtotal,
        commissionAmount,
        commissionRate,
        netPayout,
        status: 'PENDING',
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

    // Parent Order
    const newOrder = {
      _id: orderId,
      id: orderId,
      orderNumber,
      user: orderData.userId || 'usr-customer-1',
      userId: orderData.userId || 'usr-customer-1',
      userEmail: orderData.userEmail || 'customer@shopsphere.io',
      userName: orderData.userName || 'Rahul Sharma',
      items,
      sellerOrders: createdSellerOrders,
      shippingAddress: orderData.shippingAddress || {
        fullName: 'Rahul Sharma',
        phone: '+91 98765 00004',
        addressLine1: 'Indiranagar Phase 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038'
      },
      paymentMethod: orderData.paymentMethod || 'RAZORPAY',
      paymentStatus: orderData.paymentStatus || 'PAID',
      subtotal,
      tax,
      shippingFee,
      discount,
      total,
      currency: 'INR',
      status: 'Processing',
      orderStatus: 'CONFIRMED',
      trackingNumber: `SS-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      timeline: [
        { title: 'Order Placed', timestamp: new Date().toISOString(), completed: true },
        { title: 'Payment Confirmed', timestamp: new Date().toISOString(), completed: true },
        { title: 'Seller Processing', timestamp: new Date().toISOString(), completed: true },
        { title: 'Dispatched & Shipped', timestamp: null, completed: false },
        { title: 'Delivered', timestamp: null, completed: false }
      ],
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);

    // Update Product Stock Levels
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

    // Notify Customer and Super Admin
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

    // Check parent order status
    const parentOrder = this.orders.find(o => o.id === so.orderId || o._id === so.orderId);
    if (parentOrder) {
      const allSubOrders = this.sellerOrders.filter(s => s.orderId === parentOrder.id);
      const allDelivered = allSubOrders.every(s => s.status === 'DELIVERED');
      const anyShipped = allSubOrders.some(s => s.status === 'SHIPPED');

      if (allDelivered) {
        parentOrder.status = 'Delivered';
        parentOrder.orderStatus = 'DELIVERED';
        const step = parentOrder.timeline?.find(t => t.title === 'Delivered');
        if (step) { step.completed = true; step.timestamp = new Date().toISOString(); }
      } else if (anyShipped) {
        parentOrder.status = 'Shipped';
        parentOrder.orderStatus = 'SHIPPED';
        const step = parentOrder.timeline?.find(t => t.title === 'Dispatched & Shipped');
        if (step) { step.completed = true; step.timestamp = new Date().toISOString(); }
      }
    }

    return so;
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

    const payout = {
      id: `payout_${Date.now()}`,
      sellerId,
      amount: parseFloat(amount),
      currency: 'INR',
      status: 'PROCESSING',
      razorpayPayoutId: `pout_${Date.now()}`,
      bankReference: `UTR-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };

    payout.status = 'TRANSFERRED';
    this.payouts.unshift(payout);

    this.createNotification({
      recipientId: this.sellers.find(s => s.id === sellerId)?.userId,
      targetRole: 'SELLER',
      title: 'Settlement Payout Processed',
      message: `Your payout of ₹${amount.toLocaleString('en-IN')} has been transferred to your registered bank account.`,
      type: 'PAYOUT_PROCESSED',
      link: '/seller/earnings'
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
    order.orderStatus = 'CANCELLED';

    this.createNotification({
      recipientId: order.userId || order.user,
      targetRole: 'CUSTOMER',
      title: 'Refund Approved',
      message: `Your refund request for order ${order.orderNumber} (₹${refundAmount}) has been approved and processed.`,
      type: 'REFUND_PROCESSED',
      link: '/orders'
    });

    return refund;
  }

  async getAllRefunds() {
    return this.refunds;
  }

  // ============================================================================
  // SUPER ADMIN METRICS & ANALYTICS
  // ============================================================================
  async getSuperAdminAnalytics() {
    const totalGMV = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCommission = this.sellerOrders.reduce((sum, so) => sum + (so.commissionAmount || 0), 0);
    const totalOrders = this.orders.length;
    const totalCustomers = this.customers.length;
    const totalSellers = this.sellers.length;
    const totalProducts = this.products.length;

    const pendingOrders = this.orders.filter(o => o.orderStatus === 'PLACED' || o.orderStatus === 'CONFIRMED' || o.status === 'Processing').length;
    const successfulPayments = this.orders.filter(o => o.paymentStatus === 'PAID' || o.paymentStatus === 'Paid').length;
    const failedPayments = 0;
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
      failedPayments,
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
