const Statistics = require('../models/Statistics');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Payment = require('../models/Payment');
const moment = require('moment');

class StatisticsService {
  async updateStatistics() {
    try {
      const stats = await Statistics.findOne();
      const currentStats = stats || new Statistics();

      // Update total counts
      currentStats.totalVehicles = await Vehicle.countDocuments();
      currentStats.totalUsers = await User.countDocuments();
      currentStats.totalSales = await Payment.countDocuments({ status: 'completed' });

      // Calculate total revenue
      const completedPayments = await Payment.find({ status: 'completed' });
      currentStats.totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

      // Update vehicle types
      const vehicles = await Vehicle.find();
      currentStats.vehicleTypes = {
        car: vehicles.filter(v => v.type === 'car').length,
        motorcycle: vehicles.filter(v => v.type === 'motorcycle').length,
        bicycle: vehicles.filter(v => v.type === 'bicycle').length
      };

      // Update monthly sales
      const monthlySales = await Payment.aggregate([
        {
          $match: { status: 'completed' }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $limit: 12
        }
      ]);

      currentStats.monthlySales = monthlySales.map(sale => ({
        month: sale._id,
        count: sale.count,
        revenue: sale.revenue
      }));

      // Update top sellers
      const topUsers = await Payment.aggregate([
        {
          $group: {
            _id: '$user',
            sales: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]);

      currentStats.topUsers = topUsers.map(user => ({
        user: user._id,
        sales: user.sales,
        revenue: user.revenue
      }));

      currentStats.lastUpdated = new Date();
      return await currentStats.save();
    } catch (error) {
      throw error;
    }
  }

  async getStatistics() {
    try {
      let stats = await Statistics.findOne();
      if (!stats) {
        stats = await this.updateStatistics();
      }

      // Populate user information
      stats.topUsers = await Promise.all(
        stats.topUsers.map(async (userData) => {
          const user = await User.findById(userData.user).select('name email');
          return {
            ...userData.toObject(),
            user
          };
        })
      );

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getMonthlyReport(startDate, endDate) {
    try {
      const payments = await Payment.find({
        status: 'completed',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }).populate('vehicle', 'type brand model');

      const report = {
        totalSales: payments.length,
        totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
        salesByType: {
          car: payments.filter(p => p.vehicle.type === 'car').length,
          motorcycle: payments.filter(p => p.vehicle.type === 'motorcycle').length,
          bicycle: payments.filter(p => p.vehicle.type === 'bicycle').length
        },
        dailySales: {}
      };

      // Group sales by day
      payments.forEach(payment => {
        const date = moment(payment.createdAt).format('YYYY-MM-DD');
        if (!report.dailySales[date]) {
          report.dailySales[date] = {
            count: 0,
            revenue: 0
          };
        }
        report.dailySales[date].count++;
        report.dailySales[date].revenue += payment.amount;
      });

      return report;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StatisticsService(); 