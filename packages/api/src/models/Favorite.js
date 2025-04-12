const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Tạo unique index để đảm bảo mỗi người dùng chỉ có thể thích một xe một lần
favoriteSchema.index({ user: 1, vehicle: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema); 