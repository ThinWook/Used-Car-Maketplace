const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const seedVehicles = async () => {
  try {
    // Clear existing vehicles
    await Vehicle.deleteMany({});

    // Get a sample user to be the seller
    const seller = await User.findOne();
    if (!seller) {
      console.log('No seller found. Please create a user first.');
      return;
    }

    // Sample vehicles
    const vehicles = [
      {
        type: 'car',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        description: 'Well-maintained Toyota Camry with low mileage. Perfect for families.',
        images: ['/images/car.jpg'],
        condition: 'good',
        mileage: 45000,
        location: 'New York',
        seller: seller._id,
        features: ['Bluetooth', 'Backup Camera', 'Leather Seats', 'Sunroof']
      },
      {
        type: 'motorcycle',
        brand: 'Honda',
        model: 'CBR600RR',
        year: 2021,
        price: 12000,
        description: 'Sport bike in excellent condition. Ready for the track or street.',
        images: ['/images/motorcycle.jpg'],
        condition: 'like_new',
        mileage: 5000,
        location: 'Los Angeles',
        seller: seller._id,
        features: ['ABS', 'LED Lights', 'Quick Shifter', 'Traction Control']
      },
      {
        type: 'bicycle',
        brand: 'Trek',
        model: 'Madone',
        year: 2022,
        price: 3500,
        description: 'Professional road bike. Lightweight carbon frame.',
        images: ['/images/bicycle.jpg'],
        condition: 'new',
        location: 'Chicago',
        seller: seller._id,
        features: ['Carbon Frame', 'Electronic Shifting', 'Carbon Wheels', 'Aero Bars']
      }
    ];

    // Insert vehicles
    await Vehicle.insertMany(vehicles);
    console.log('Sample vehicles added successfully');
  } catch (error) {
    console.error('Error seeding vehicles:', error);
  }
};

module.exports = seedVehicles; 