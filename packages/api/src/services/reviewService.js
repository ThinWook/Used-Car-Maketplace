const Review = require('../models/Review');
const User = require('../models/User');

class ReviewService {
  async createReview(reviewData) {
    try {
      const review = new Review(reviewData);
      return await review.save();
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByUser(userId) {
    try {
      return await Review.find({ user: userId })
        .populate('reviewer', 'full_name avatar_url')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getUserRating(userId) {
    try {
      const reviews = await Review.find({ user: userId });
      if (reviews.length === 0) return 0;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / reviews.length;
    } catch (error) {
      throw error;
    }
  }

  async updateReview(reviewId, updateData) {
    try {
      return await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(reviewId) {
    try {
      return await Review.findByIdAndDelete(reviewId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReviewService(); 