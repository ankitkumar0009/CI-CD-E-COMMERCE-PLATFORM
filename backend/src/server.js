const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/database');

const startServer = async () => {
  // Attempt DB connection
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 ${config.appName} v${config.appVersion} LIVE`);
    console.log(`🌐 Environment: ${config.nodeEnv} | AWS Target: ${config.environment}`);
    console.log(`📡 Listening on: http://localhost:${config.port}`);
    console.log(`📊 Prometheus Metrics: http://localhost:${config.port}/metrics`);
    console.log(`💓 Health Status: http://localhost:${config.port}/health`);
    console.log(`⚙️ DevOps Telemetry: http://localhost:${config.port}/api/devops/status`);
    console.log('====================================================');
  });

  // Graceful Shutdown for Kubernetes & Docker Lifecycle
  const gracefulShutdown = (signal) => {
    console.log(`🛑 ${signal} received. Initiating graceful shutdown...`);
    server.close(() => {
      console.log('🔒 Closed all remaining active HTTP connections.');
      process.exit(0);
    });

    // Force close after 10 seconds if active requests don't finish
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
