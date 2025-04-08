const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Sample users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '123-456-7890',
        address: '123 Main St, New York, NY 10001',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '098-765-4321',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        phone: '555-555-5555',
        address: '789 Pine St, Chicago, IL 60601',
        role: 'admin'
      }
    ];

    // Insert users
    await User.insertMany(users);
    console.log('Sample users added successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedUsers; 