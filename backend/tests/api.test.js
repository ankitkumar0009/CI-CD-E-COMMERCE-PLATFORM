// ==============================================================================
// SHOPSPHERE & CLOUDOPS - Automated API & Integration Test Suite
// Verifies K8s Health Probes, Prometheus Metrics, Auth, 14 Categories,
// Multi-Vendor Architecture, Razorpay Cryptographic Verification & Admin Analytics
// ==============================================================================

const request = require('supertest');
const app = require('../src/app');

describe('🚀 ShopSphere Multi-Vendor API Automated Test Suite', () => {

  describe('Health Probes (K8s Liveness & Readiness)', () => {
    it('GET /health should return 200 with service UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.environment).toBeDefined();
    });

    it('GET /health/live should respond 200 ALIVE for K8s liveness probe', async () => {
      const res = await request(app).get('/health/live');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ALIVE');
    });

    it('GET /health/ready should respond 200 READY for K8s readiness probe', async () => {
      const res = await request(app).get('/health/ready');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('READY');
      expect(res.body.checks.database).toBe('UP');
    });
  });

  describe('Prometheus Metrics Telemetry', () => {
    it('GET /metrics should expose Prometheus formatted metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('http_requests_total');
      expect(res.text).toContain('http_request_duration_seconds');
    });
  });

  describe('Authentication & Security', () => {
    const testEmail = `devops_tester_${Date.now()}@shopsphere.io`;

    it('POST /api/auth/register should register a new customer and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'DevOps Engineer',
          email: testEmail,
          password: 'Password@123',
          role: 'CUSTOMER'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('POST /api/auth/login should authenticate default admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@shopsphere.io',
          password: 'Admin@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(['ADMIN', 'SUPER_ADMIN', 'admin']).toContain(res.body.data.user.role);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login with invalid password should fail', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@shopsphere.io',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('15 Product Categories', () => {
    it('GET /api/categories should return all 15 product departments', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(15);

      const categoryNames = res.body.data.map(c => c.name);
      expect(categoryNames).toContain('Electronics');
      expect(categoryNames).toContain('Mobile Phones');
      expect(categoryNames).toContain('Laptops');
      expect(categoryNames).toContain('Fashion');
      expect(categoryNames).toContain('Clothing');
      expect(categoryNames).toContain('Shoes');
      expect(categoryNames).toContain('Grocery');
      expect(categoryNames).toContain('Home and Kitchen');
      expect(categoryNames).toContain('Furniture');
      expect(categoryNames).toContain('Beauty Products');
      expect(categoryNames).toContain('Sports');
      expect(categoryNames).toContain('Books');
      expect(categoryNames).toContain('Watches');
      expect(categoryNames).toContain('Accessories');
      expect(categoryNames).toContain('Toys');
    });
  });

  describe('Products Catalog & Filtering', () => {
    it('GET /api/products should return product list with pagination', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    it('GET /api/products/categories should return available categories', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Cart & Multi-Vendor Checkout Flow', () => {
    it('POST /api/cart should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('x-session-id', 'test-session-123')
        .send({
          productId: 'prod-elec-1',
          quantity: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.itemCount).toBe(1);
      expect(res.body.data.subtotal).toBeGreaterThan(0);
    });

    it('POST /api/orders should successfully place multi-vendor order and split seller sub-orders', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              productId: 'prod-elec-1',
              name: 'AcousticPro ANC Wireless Headphones',
              price: 14999,
              quantity: 1,
              storeId: 'sto-1'
            }
          ],
          shippingAddress: {
            fullName: 'Rahul Sharma',
            phone: '+91 98765 00004',
            addressLine1: 'Indiranagar Phase 2',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
            country: 'India'
          },
          subtotal: 14999,
          tax: 2700,
          shippingFee: 0,
          total: 17699
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.sellerOrders).toBeDefined();
      expect(res.body.data.sellerOrders.length).toBeGreaterThan(0);
    });
  });

  describe('Real Razorpay Payment Integration', () => {
    let customerToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'customer@shopsphere.io', password: 'Customer@123' });
      customerToken = loginRes.body.data.token;
    });

    it('GET /api/payments/config should return public Razorpay key ID', async () => {
      const res = await request(app).get('/api/payments/config');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.keyId).toBeDefined();
      expect(res.body.data.currency).toBe('INR');
    });

    it('POST /api/payments/razorpay/order should generate Razorpay order', async () => {
      const res = await request(app)
        .post('/api/payments/razorpay/order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 14999, receipt: 'rcpt_test_001' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.amount).toBe(1499900); // 14999 * 100 paise
      expect(res.body.data.currency).toBe('INR');
    });

    it('POST /api/payments/razorpay/verify should cryptographically verify payment signature', async () => {
      const res = await request(app)
        .post('/api/payments/razorpay/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          razorpay_order_id: 'order_test_998877',
          razorpay_payment_id: 'pay_test_332211',
          razorpay_signature: 'sig_test_verified',
          orderData: {
            items: [{ productId: 'prod-elec-1', name: 'AcousticPro ANC Headphones', price: 14999, quantity: 1 }],
            subtotal: 14999,
            tax: 2700,
            shippingFee: 0,
            total: 17699
          }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.status).toBe('PAID');
    });
  });

  describe('Seller KYC & Storefront Operations', () => {
    let sellerToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'seller@shopsphere.io', password: 'Seller@123' });
      sellerToken = loginRes.body.data.token;
    });

    it('GET /api/seller/profile should return seller KYC and store data', async () => {
      const res = await request(app)
        .get('/api/seller/profile')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.businessName).toBeDefined();
      expect(res.body.data.kycStatus).toBe('APPROVED');
    });

    it('GET /api/seller/earnings should report gross sales and platform commission', async () => {
      const res = await request(app)
        .get('/api/seller/earnings')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.grossEarnings).toBeGreaterThanOrEqual(0);
      expect(res.body.data.totalCommissionDeducted).toBeGreaterThanOrEqual(0);
      expect(res.body.data.availableBalance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Super Admin Dashboard & Analytics', () => {
    let adminToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@shopsphere.io', password: 'Admin@123' });
      adminToken = loginRes.body.data.token;
    });

    it('GET /api/admin/analytics should return platform GMV and Commission', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalGMV).toBeGreaterThanOrEqual(0);
      expect(res.body.data.platformCommission).toBeGreaterThanOrEqual(0);
      expect(res.body.data.totalSellers).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalProducts).toBeGreaterThanOrEqual(14);
    });

    it('GET /api/admin/sellers should return verified sellers list', async () => {
      const res = await request(app)
        .get('/api/admin/sellers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DevOps Dashboard Telemetry', () => {
    it('GET /api/devops/status should return system memory, CPU load, and AWS status', async () => {
      const res = await request(app).get('/api/devops/status');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.system.memory).toBeDefined();
      expect(res.body.data.cloudInfrastructure.provider).toBe('Amazon Web Services (AWS)');
    });

    it('GET /api/devops/pipeline-history should return CI/CD run history', async () => {
      const res = await request(app).get('/api/devops/pipeline-history');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/devops/k8s-topology should return Kubernetes pods and nodes status', async () => {
      const res = await request(app).get('/api/devops/k8s-topology');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.pods)).toBe(true);
      expect(Array.isArray(res.body.data.nodes)).toBe(true);
    });
  });

});
