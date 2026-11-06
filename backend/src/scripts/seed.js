const mongoose = require('mongoose');
const config = require('../config');
const { defaultUsers, sampleProducts, sampleOrders } = require('../data/seedData');

const seedData = async () => {
  try {
    console.log(`Connecting to database at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('Connected! Seeding collections...');

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
    }
    console.log('Cleared existing collections.');

    await mongoose.connection.db.collection('users').insertMany(defaultUsers);
    await mongoose.connection.db.collection('products').insertMany(sampleProducts);
    await mongoose.connection.db.collection('orders').insertMany(sampleOrders);

    console.log(`✅ Seeded ${defaultUsers.length} users, ${sampleProducts.length} products, and ${sampleOrders.length} orders.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
