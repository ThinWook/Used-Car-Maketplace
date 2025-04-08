const mongoose = require('mongoose');
const seedUsers = require('./users');
const seedVehicles = require('./vehicles');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-marketplace');
    console.log('Connected to MongoDB');

    // Run seeds
    await seedUsers();
    await seedVehicles();

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 