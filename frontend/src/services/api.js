// ==============================================================================
// SHOPSPHERE - Unified API Client Service
// Integrates 14 Categories, Multi-Vendor Operations, Razorpay Payments,
// Seller Hub, Super Admin Control, and DevOps Telemetry
// ==============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('cloudops_token') || localStorage.getItem('shopsphere_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const sessionId = localStorage.getItem('cloudops_session_id') || `sess_${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem('cloudops_session_id', sessionId);
  headers['x-session-id'] = sessionId;
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // --- AUTH & USER PROFILE ---
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    }).then(handleResponse),

  googleLogin: (googleData) =>
    fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(googleData)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders()
    }).then(handleResponse),

  updateProfile: (profileData) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    }).then(handleResponse),

  getAddresses: () =>
    fetch(`${BASE_URL}/auth/addresses`, {
      headers: getHeaders()
    }).then(handleResponse),

  addAddress: (addressData) =>
    fetch(`${BASE_URL}/auth/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addressData)
    }).then(handleResponse),

  // --- 14 CATEGORIES (PUBLIC & ADMIN CRUD) ---
  getAllCategories: () =>
    fetch(`${BASE_URL}/categories`, {
      headers: getHeaders()
    }).then(handleResponse),

  getCategories: () =>
    fetch(`${BASE_URL}/categories`, {
      headers: getHeaders()
    }).then(handleResponse),

  createCategory: (catData) =>
    fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(catData)
    }).then(handleResponse),

  updateCategory: (id, catData) =>
    fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(catData)
    }).then(handleResponse),

  deleteCategory: (id) =>
    fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // --- PRODUCTS (MULTI-VENDOR) ---
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/products?${query}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  getProduct: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  createProduct: (productData) =>
    fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    }).then(handleResponse),

  updateProduct: (id, productData) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    }).then(handleResponse),

  deleteProduct: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  addReview: (id, reviewData) =>
    fetch(`${BASE_URL}/products/${id}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData)
    }).then(handleResponse),

  // --- CART & WISHLIST ---
  getCart: () =>
    fetch(`${BASE_URL}/cart`, {
      headers: getHeaders()
    }).then(handleResponse),

  addToCart: (productId, quantity = 1) =>
    fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    }).then(handleResponse),

  updateCartItem: (itemId, quantity) =>
    fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ quantity })
    }).then(handleResponse),

  removeCartItem: (itemId) =>
    fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  clearCart: () =>
    fetch(`${BASE_URL}/cart`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  getWishlist: () =>
    fetch(`${BASE_URL}/cart/wishlist/items`, {
      headers: getHeaders()
    }).then(handleResponse),

  toggleWishlist: (productId) =>
    fetch(`${BASE_URL}/cart/wishlist/${productId}`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  // --- REAL RAZORPAY PAYMENT INTEGRATION ---
  getPaymentConfig: () =>
    fetch(`${BASE_URL}/payments/config`, {
      headers: getHeaders()
    }).then(handleResponse),

  createRazorpayOrder: (amount, receipt, notes = {}) =>
    fetch(`${BASE_URL}/payments/razorpay/order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, receipt, notes })
    }).then(handleResponse),

  verifyRazorpayPayment: (verificationPayload) =>
    fetch(`${BASE_URL}/payments/razorpay/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(verificationPayload)
    }).then(handleResponse),

  requestRefund: (orderId, reason, amount) =>
    fetch(`${BASE_URL}/payments/refund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, reason, amount })
    }).then(handleResponse),

  // --- ORDERS ---
  createOrder: (orderData) =>
    fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${BASE_URL}/orders/my-orders`, {
      headers: getHeaders()
    }).then(handleResponse),

  getOrder: (id) =>
    fetch(`${BASE_URL}/orders/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  getAllOrders: () =>
    fetch(`${BASE_URL}/orders/admin/all`, {
      headers: getHeaders()
    }).then(handleResponse),

  updateOrderStatus: (id, status) =>
    fetch(`${BASE_URL}/orders/admin/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // --- SELLER PORTAL ---
  getSellerProfile: () =>
    fetch(`${BASE_URL}/seller/profile`, {
      headers: getHeaders()
    }).then(handleResponse),

  submitSellerKyc: (kycData) =>
    fetch(`${BASE_URL}/seller/kyc`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(kycData)
    }).then(handleResponse),

  updateStoreProfile: (storeData) =>
    fetch(`${BASE_URL}/seller/store`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(storeData)
    }).then(handleResponse),

  getSellerProducts: () =>
    fetch(`${BASE_URL}/seller/products`, {
      headers: getHeaders()
    }).then(handleResponse),

  createSellerProduct: (productData) =>
    fetch(`${BASE_URL}/seller/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    }).then(handleResponse),

  updateSellerProduct: (id, productData) =>
    fetch(`${BASE_URL}/seller/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    }).then(handleResponse),

  deleteSellerProduct: (id) =>
    fetch(`${BASE_URL}/seller/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  getSellerOrders: () =>
    fetch(`${BASE_URL}/seller/orders`, {
      headers: getHeaders()
    }).then(handleResponse),

  updateSellerOrderStatus: (id, status, tracking = {}) =>
    fetch(`${BASE_URL}/seller/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, ...tracking })
    }).then(handleResponse),

  getSellerEarnings: () =>
    fetch(`${BASE_URL}/seller/earnings`, {
      headers: getHeaders()
    }).then(handleResponse),

  requestSellerPayout: (amount) =>
    fetch(`${BASE_URL}/seller/payouts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    }).then(handleResponse),

  // --- SUPER ADMIN DASHBOARD ---
  getAdminAnalytics: () =>
    fetch(`${BASE_URL}/admin/analytics`, {
      headers: getHeaders()
    }).then(handleResponse),

  getAllSellers: () =>
    fetch(`${BASE_URL}/admin/sellers`, {
      headers: getHeaders()
    }).then(handleResponse),

  approveSellerKyc: (sellerId) =>
    fetch(`${BASE_URL}/admin/sellers/${sellerId}/approve`, {
      method: 'PUT',
      headers: getHeaders()
    }).then(handleResponse),

  rejectSellerKyc: (sellerId, reason) =>
    fetch(`${BASE_URL}/admin/sellers/${sellerId}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    }).then(handleResponse),

  updateSellerCommission: (sellerId, rate) =>
    fetch(`${BASE_URL}/admin/sellers/${sellerId}/commission`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ rate })
    }).then(handleResponse),

  getAllRefunds: () =>
    fetch(`${BASE_URL}/admin/refunds`, {
      headers: getHeaders()
    }).then(handleResponse),

  getAllUsers: () =>
    fetch(`${BASE_URL}/admin/users`, {
      headers: getHeaders()
    }).then(handleResponse),

  toggleUserStatus: (userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getHeaders()
    }).then(handleResponse),

  getFinancialReportUrl: () => `${BASE_URL}/admin/export/financials`,

  // --- NOTIFICATIONS ---
  getNotifications: () =>
    fetch(`${BASE_URL}/notifications`, {
      headers: getHeaders()
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    }).then(handleResponse),

  // --- DEVOPS & OBSERVABILITY ---
  getDevOpsStatus: () =>
    fetch(`${BASE_URL}/devops/status`, {
      headers: getHeaders()
    }).then(handleResponse),

  getPipelineHistory: () =>
    fetch(`${BASE_URL}/devops/pipeline-history`, {
      headers: getHeaders()
    }).then(handleResponse),

  triggerPipeline: (data = {}) =>
    fetch(`${BASE_URL}/devops/pipeline/trigger`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  getK8sTopology: () =>
    fetch(`${BASE_URL}/devops/k8s-topology`, {
      headers: getHeaders()
    }).then(handleResponse),

  getDockerInfo: () =>
    fetch(`${BASE_URL}/devops/docker-info`, {
      headers: getHeaders()
    }).then(handleResponse)
};
