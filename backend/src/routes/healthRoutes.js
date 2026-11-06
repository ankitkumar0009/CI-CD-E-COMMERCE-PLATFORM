const express = require('express');
const router = express.Router();
const config = require('../config');
const { getDBStatus } = require('../config/database');

const startTime = Date.now();

// Standard Health check
router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    version: config.appVersion,
    environment: config.environment,
    service: config.appName,
    database: dbStatus.connected ? 'healthy' : 'degraded',
    checks: {
      api: 'healthy',
      database: dbStatus.connected ? 'healthy' : 'warning',
      memory: 'healthy'
    }
  });
});

// Kubernetes Liveness probe: checks if process is responsive
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    uptime: process.uptime()
  });
});

// Kubernetes Readiness probe: checks if service is ready to accept traffic
router.get('/ready', (req, res) => {
  const dbStatus = getDBStatus();
  if (dbStatus.connected) {
    res.status(200).json({
      status: 'READY',
      database: dbStatus.engine
    });
  } else {
    res.status(503).json({
      status: 'NOT_READY',
      error: 'Database connection initializing'
    });
  }
});

// Kubernetes Startup probe
router.get('/startup', (req, res) => {
  res.status(200).json({
    status: 'STARTED',
    bootTimeMs: Date.now() - startTime
  });
});

module.exports = router;

