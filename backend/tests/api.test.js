const request = require('supertest');
const app = require('../src/app');

describe('🚀 CloudOps E-Commerce API Automated Test Suite', () => {

  describe('Health Probes (K8s Liveness & Readiness)', () => {
    it('GET /health should return 200 with service UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.checks).toBeDefined();
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
    const testEmail = `tester_${Date.now()}@devops.cloud`;

    it('POST /api/auth/register should register a new user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'CI Pipeline Tester',
          email: testEmail,
          password: 'Password@123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined(); // Password must never leak
    });

    it('POST /api/auth/login should authenticate default admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ecommerce.io',
          password: 'Admin@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login with invalid password should fail', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ecommerce.io',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
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

    it('GET /api/products/:id should return single product details', async () => {
      const res = await request(app).get('/api/products/prod_001');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('MacBook Pro');
    });
  });

  describe('Cart & Checkout Flow', () => {
    it('POST /api/cart should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('x-session-id', 'test-session-123')
        .send({
          productId: 'prod_002',
          quantity: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.itemCount).toBe(2);
      expect(res.body.data.subtotal).toBeGreaterThan(0);
    });

    it('POST /api/orders should successfully place order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              productId: 'prod_002',
              name: 'Sony WH-1000XM5',
              price: 398.00,
              quantity: 1,
              image: 'https://example.com/sony.jpg'
            }
          ],
          shippingAddress: {
            fullName: 'CI Runner',
            street: '123 Cloud Way',
            city: 'Cloud City',
            state: 'WA',
            postalCode: '98101',
            country: 'USA'
          },
          subtotal: 398.00,
          tax: 31.84,
          shippingFee: 0,
          total: 429.84
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.status).toBe('Processing');
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
