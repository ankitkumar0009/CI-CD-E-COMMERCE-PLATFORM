const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('cloudops_token');
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
  // Auth
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

  // Products
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

  getCategories: () =>
    fetch(`${BASE_URL}/products/categories`, {
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

  // Cart
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

  // Wishlist
  getWishlist: () =>
    fetch(`${BASE_URL}/cart/wishlist/items`, {
      headers: getHeaders()
    }).then(handleResponse),

  toggleWishlist: (productId) =>
    fetch(`${BASE_URL}/cart/wishlist/${productId}`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  // Orders
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

  // DevOps Telemetry & Monitoring
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
    }).then(handleResponse),

  // Admin Analytics
  getAdminAnalytics: () =>
    fetch(`${BASE_URL}/admin/analytics`, {
      headers: getHeaders()
    }).then(handleResponse)
};

