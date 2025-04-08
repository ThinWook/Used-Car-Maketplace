const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  totalVehicles: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  vehicleTypes: {
    car: { type: Number, default: 0 },
    motorcycle: { type: Number, default: 0 },
    bicycle: { type: Number, default: 0 }
  },
  monthlySales: [{
    month: String,
    count: Number,
    revenue: Number
  }],
  topSellers: [{
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sales: Number,
    revenue: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Statistics', statisticsSchema); 