const reviewService = require('../services/reviewService');

const reviewController = {
  // Create a new review
  createReview: async (req, res) => {
    try {
      const reviewData = {
        ...req.body,
        reviewer: req.user._id
      };
      const review = await reviewService.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get reviews by user
  getReviewsByUser: async (req, res) => {
    try {
      const reviews = await reviewService.getReviewsByUser(req.params.userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user rating
  getUserRating: async (req, res) => {
    try {
      const rating = await reviewService.getUserRating(req.params.userId);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update review
  updateReview: async (req, res) => {
    try {
      const review = await reviewService.updateReview(req.params.id, req.body);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete review
  deleteReview: async (req, res) => {
    try {
      const review = await reviewService.deleteReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = reviewController; 