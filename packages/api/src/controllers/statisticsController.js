const statisticsService = require('../services/statisticsService');
const { admin } = require('../middleware/auth');

const statisticsController = {
  // Get general statistics
  getStatistics: async (req, res) => {
    try {
      const stats = await statisticsService.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update statistics
  updateStatistics: async (req, res) => {
    try {
      const stats = await statisticsService.updateStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get monthly report
  getMonthlyReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const report = await statisticsService.getMonthlyReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = statisticsController; 