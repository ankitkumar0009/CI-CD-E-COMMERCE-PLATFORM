const { defaultUsers, sampleProducts, sampleOrders } = require('../data/seedData');
const bcrypt = require('bcryptjs');

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(defaultUsers));
    this.products = JSON.parse(JSON.stringify(sampleProducts));
    this.orders = JSON.parse(JSON.stringify(sampleOrders));
    this.carts = new Map(); // userId -> items[]
    this.wishlists = new Map(); // userId -> Set(productId)

    // Pre-populate demo user's cart and wishlist
    this.carts.set('usr_demo_002', [
      {
        id: 'cart_item_1',
        productId: 'prod_005',
        name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
        price: 199.00,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
        quantity: 1,
        stock: 50
      }
    ]);

    this.wishlists.set('usr_demo_002', new Set(['prod_001', 'prod_003']));
  }

  // --- USER METHODS ---
  async findUserById(id) {
    const user = this.users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findUserByEmail(email, includePassword = false) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (includePassword) return user;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'user',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      createdAt: new Date()
    };
    
    this.users.push(newUser);
    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  async updateUser(id, updateData) {
    const index = this.users.findIndex(u => u._id === id);
    if (index === -1) return null;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    this.users[index] = { ...this.users[index], ...updateData, updatedAt: new Date() };
    const { password, ...safeUser } = this.users[index];
    return safeUser;
  }

  async countUsers() {
    return this.users.length;
  }

  // --- PRODUCT METHODS ---
  async findProducts({ category, search, minPrice, maxPrice, rating, inStock, sort, page = 1, limit = 50 }) {
    let result = [...this.products];

    if (category && category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
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
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      default:
        // Featured first, then rating
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit)
    };
  }

  async findProductById(id) {
    return this.products.find(p => p._id === id || p.slug === id) || null;
  }

  async createProduct(productData) {
    const newProduct = {
      _id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      stock: parseInt(productData.stock, 10) || 0,
      price: parseFloat(productData.price) || 0,
      originalPrice: parseFloat(productData.originalPrice) || parseFloat(productData.price) * 1.15,
      rating: parseFloat(productData.rating) || 5.0,
      numReviews: 0,
      isFeatured: !!productData.isFeatured,
      isNewArrival: !!productData.isNewArrival,
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.image],
      reviews: [],
      specs: productData.specs || {},
      createdAt: new Date(),
      ...productData
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const index = this.products.findIndex(p => p._id === id);
    if (index === -1) return null;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock, 10);

    this.products[index] = { ...this.products[index], ...updateData, updatedAt: new Date() };
    return this.products[index];
  }

  async deleteProduct(id) {
    const index = this.products.findIndex(p => p._id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  async getCategories() {
    const categoriesMap = new Map();
    this.products.forEach(p => {
      const cat = p.category;
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });
    return Array.from(categoriesMap.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }

  async addProductReview(productId, reviewData) {
    const product = await this.findProductById(productId);
    if (!product) return null;

    const newReview = {
      id: `rev_${Date.now()}`,
      user: reviewData.userName || 'Verified Shopper',
      rating: parseInt(reviewData.rating, 10) || 5,
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0]
    };

    product.reviews.unshift(newReview);
    product.numReviews = product.reviews.length;
    const totalScore = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = parseFloat((totalScore / product.numReviews).toFixed(1));

    return product;
  }

  // --- CART METHODS ---
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
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
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

  // --- WISHLIST METHODS ---
  async getWishlist(userId) {
    const productIds = Array.from(this.wishlists.get(userId) || []);
    return this.products.filter(p => productIds.includes(p._id));
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

  // --- ORDER METHODS ---
  async createOrder(orderData) {
    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      user: orderData.userId,
      userEmail: orderData.userEmail,
      userName: orderData.userName,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      paymentStatus: 'Paid',
      subtotal: parseFloat(orderData.subtotal) || 0,
      tax: parseFloat(orderData.tax) || 0,
      shippingFee: parseFloat(orderData.shippingFee) || 0,
      discount: parseFloat(orderData.discount) || 0,
      total: parseFloat(orderData.total) || 0,
      status: 'Processing',
      trackingNumber: `TRK-AWS-US-${Math.floor(100000 + Math.random() * 900000)}`,
      timeline: [
        { title: 'Order Placed', timestamp: new Date().toISOString(), completed: true },
        { title: 'Payment Confirmed', timestamp: new Date().toISOString(), completed: true },
        { title: 'Processing in Fulfillment Center', timestamp: new Date().toISOString(), completed: true },
        { title: 'Shipped', timestamp: null, completed: false },
        { title: 'Delivered', timestamp: null, completed: false }
      ],
      createdAt: new Date()
    };

    this.orders.unshift(newOrder);

    // Update product stock
    for (const item of orderData.items) {
      const product = await this.findProductById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    // Clear user cart
    if (orderData.userId) {
      await this.clearCart(orderData.userId);
    }

    return newOrder;
  }

  async findOrdersByUser(userId) {
    return this.orders.filter(o => o.user === userId);
  }

  async findOrderById(id) {
    return this.orders.find(o => o._id === id || o.orderNumber === id) || null;
  }

  async findAllOrders() {
    return this.orders;
  }

  async updateOrderStatus(id, status) {
    const order = await this.findOrderById(id);
    if (!order) return null;

    order.status = status;
    const now = new Date().toISOString();

    if (status === 'Shipped') {
      const step = order.timeline.find(t => t.title === 'Shipped');
      if (step) { step.completed = true; step.timestamp = now; }
    } else if (status === 'Delivered') {
      const step1 = order.timeline.find(t => t.title === 'Shipped');
      if (step1 && !step1.completed) { step1.completed = true; step1.timestamp = now; }
      const step2 = order.timeline.find(t => t.title === 'Delivered');
      if (step2) { step2.completed = true; step2.timestamp = now; }
    }

    return order;
  }

  // --- ANALYTICS ---
  async getAnalytics() {
    const totalRevenue = this.orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = this.orders.length;
    const totalProducts = this.products.length;
    const totalUsers = this.users.length;
    const lowStockCount = this.products.filter(p => p.stock < 20).length;

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalProducts,
      totalUsers,
      lowStockCount,
      recentOrders: this.orders.slice(0, 5),
      monthlySales: [
        { month: 'Oct 2025', revenue: 14200, orders: 48 },
        { month: 'Nov 2025', revenue: 23400, orders: 82 },
        { month: 'Dec 2025', revenue: 38900, orders: 135 },
        { month: 'Jan 2026', revenue: 28500, orders: 94 },
        { month: 'Feb 2026', revenue: 34100, orders: 112 },
        { month: 'Mar 2026', revenue: totalRevenue, orders: totalOrders }
      ]
    };
  }
}

// Singleton instance
const store = new DataStore();
module.exports = store;

