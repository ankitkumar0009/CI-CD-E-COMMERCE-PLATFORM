const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_devops',
  jwtSecret: process.env.JWT_SECRET || 'devops-secret-key-super-secure-change-in-prod-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  appName: 'CloudOps E-Commerce API',
  appVersion: process.env.APP_VERSION || '1.0.0',
  gitCommit: process.env.GIT_COMMIT || 'c8f7d2a',
  environment: process.env.ENVIRONMENT || 'Production - AWS EKS',
  region: process.env.AWS_REGION || 'us-east-1'
};
