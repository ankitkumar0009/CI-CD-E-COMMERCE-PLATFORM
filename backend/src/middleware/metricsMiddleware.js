const client = require('prom-client');

// Initialize registry
const register = new client.Registry();

// Enable default system metrics (CPU, Memory, Process, Event Loop)
client.collectDefaultMetrics({
  register,
  prefix: 'ecommerce_app_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2]
});

// Custom HTTP Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code']
});

const activeRequestsGauge = new client.Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests currently in flight'
});

const orderCounter = new client.Counter({
  name: 'ecommerce_orders_total',
  help: 'Total number of successful orders placed'
});

const revenueCounter = new client.Counter({
  name: 'ecommerce_revenue_total_usd',
  help: 'Total sales revenue in USD'
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeRequestsGauge);
register.registerMetric(orderCounter);
register.registerMetric(revenueCounter);

const metricsMiddleware = (req, res, next) => {
  // Skip metrics route itself to avoid recursive inflation
  if (req.path === '/metrics' || req.path.startsWith('/health')) {
    return next();
  }

  activeRequestsGauge.inc();
  const start = process.hrtime();

  res.on('finish', () => {
    activeRequestsGauge.dec();
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;

    // Normalize path to avoid high cardinality route labels (e.g. /api/products/prod_123 -> /api/products/:id)
    const route = req.baseUrl + (req.route ? req.route.path : req.path.replace(/\/(prod_|ord_|rev_|usr_)[a-zA-Z0-9_-]+/g, '/:id'));

    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(durationSeconds);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  orderCounter,
  revenueCounter
};
