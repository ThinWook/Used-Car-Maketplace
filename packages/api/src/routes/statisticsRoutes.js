const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Statistics routes
router.get('/', statisticsController.getStatistics);
router.post('/update', statisticsController.updateStatistics);
router.get('/monthly-report', statisticsController.getMonthlyReport);

module.exports = router; 