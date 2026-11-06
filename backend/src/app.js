const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { register, metricsMiddleware } = require('./middleware/metricsMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const devopsRoutes = require('./routes/devopsRoutes');
const healthRoutes = require('./routes/healthRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Prometheus Metrics Middleware (Instrument every incoming request)
app.use(metricsMiddleware);

// --- Prometheus Scrape Endpoint ---
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (ex) {
    res.status(500).send(ex.message);
  }
});

// --- Health Check Endpoints (K8s Probes) ---
app.use('/health', healthRoutes);

// --- API Endpoints ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/devops', devopsRoutes);
app.use('/api/admin', adminRoutes);

// Root greeting / info endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CloudOps E-Commerce Platform API',
    version: config.appVersion,
    environment: config.environment,
    documentation: '/api/docs',
    health: '/health',
    metrics: '/metrics',
    status: '/api/devops/status'
  });
});

// 404 Catch-all Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;

