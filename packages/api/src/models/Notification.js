const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Tạo index để tăng tốc độ truy vấn
  },
  type: {
    type: String,
    enum: ['vehicle_approved', 'vehicle_rejected', 'new_message', 'new_follower', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reference_model'
  },
  reference_model: {
    type: String,
    enum: ['Vehicle', 'Chat', 'User']
  },
  link: {
    type: String
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Tạo index cho is_read và created_at để tối ưu query
notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 