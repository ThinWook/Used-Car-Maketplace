const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common fields for all users
  full_name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone_number: {
    type: String,
    required: true
  },
  password_hash: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    default: '/user-avatar.png'
  },
  cover_image_url: {
    type: String,
    default: '/cover-placeholder.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // KYC fields for verification
  kyc_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  identity_document_type: {
    type: String,
    enum: ['CMND', 'CCCD', 'Hộ chiếu'],
    sparse: true
  },
  identity_document_number: {
    type: String,
    sparse: true
  },
  identity_document_images: {
    front: { type: String },
    back: { type: String }
  },
  
  // Bank account information for KYC
  bank_account_name: {
    type: String,
    sparse: true
  },
  bank_account_number: {
    type: String,
    sparse: true
  },
  bank_name: {
    type: String,
    sparse: true
  },
  
  // Thông tin tài khoản và thông tin người dùng
  wallet_balance: {
    type: Number,
    default: 0
  },
  
  // Xe yêu thích
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the "updated_at" field on save
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema); 