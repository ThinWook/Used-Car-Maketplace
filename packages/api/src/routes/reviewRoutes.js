const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/user/:userId', reviewController.getReviewsByUser);
router.get('/user/:userId/rating', reviewController.getUserRating);

// Protected routes
router.use(protect);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router; 