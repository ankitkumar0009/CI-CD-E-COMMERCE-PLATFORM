const mongoose = require('mongoose');
const config = require('./index');

let isMongoConnected = false;

const connectDB = async () => {
  if (process.env.USE_MEMORY_DB === 'true') {
    console.log('📦 Operating in In-Memory Database mode (USE_MEMORY_DB=true)');
    return false;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout so fallback triggers without blocking startup
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    console.log(`🚀 Seamlessly falling back to Resilient In-Memory Database Engine for zero-dependency execution.`);
    isMongoConnected = false;
    return false;
  }
};

const getDBStatus = () => {
  return {
    engine: isMongoConnected ? 'MongoDB / AWS DocumentDB' : 'Resilient In-Memory Data Engine',
    connected: true,
    mongoConnected: isMongoConnected,
    uri: isMongoConnected ? config.mongoUri.replace(/:([^:@]{1,})@/, ':****@') : 'internal://memory-store'
  };
};

module.exports = {
  connectDB,
  getDBStatus,
  isMongoConnected: () => isMongoConnected
};
