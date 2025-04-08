const userService = require('../services/userService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userController = {
  // Register new user
  registerUser: async (req, res) => {
    try {
      const { 
        full_name, 
        email, 
        phone_number, 
        address, 
        password, 
        role = 'user' // Default to user if not specified
      } = req.body;

      // Luôn đặt role là 'user', không cho phép đăng ký tài khoản admin
      const userRole = 'user';

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }

      // Create new user
      const user = await User.create({
        full_name,
        email,
        phone_number,
        address,
        password_hash: password, // Will be hashed by pre-save hook
        role: userRole // Luôn sử dụng 'user', bỏ qua giá trị role từ request
      });

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      // Return new user (excluding password)
      res.status(201).json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        rating: user.rating,
        created_at: user.created_at,
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      // Return user (excluding password)
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        rating: user.rating,
        created_at: user.created_at,
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_image_url: user.cover_image_url,
        rating: user.rating,
        kyc_status: user.kyc_status,
        created_at: user.created_at,
        updated_at: user.updated_at
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields if provided
      user.full_name = req.body.full_name || user.full_name;
      user.email = req.body.email || user.email;
      user.phone_number = req.body.phone_number || user.phone_number;
      user.address = req.body.address || user.address;
      
      // Update password if provided
      if (req.body.password) {
        user.password_hash = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar_url,
        cover_image_url: updatedUser.cover_image_url,
        rating: updatedUser.rating,
        kyc_status: updatedUser.kyc_status,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update user avatar
  updateUserAvatar: async (req, res) => {
    try {
      console.log('Upload avatar request received');
      console.log('User:', req.user);
      console.log('Files:', req.file);

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update avatar field
      user.avatar_url = req.file.path;
      await user.save();

      console.log('Upload successful. New avatar:', user.avatar_url);
      res.json({ 
        avatar_url: user.avatar_url,
        message: 'Avatar updated successfully' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update user cover image
  updateUserCoverImage: async (req, res) => {
    try {
      console.log('Upload cover image request received');
      console.log('User:', req.user);
      console.log('Files:', req.file);

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update cover image field
      user.cover_image_url = req.file.path;
      await user.save();

      console.log('Upload successful. New cover image:', user.cover_image_url);
      res.json({ 
        cover_image_url: user.cover_image_url,
        message: 'Cover image updated successfully' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      await userService.deleteUser(req.user._id);
      res.json({ message: 'User removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Upload KYC documents
  uploadKycDocuments: async (req, res) => {
    try {
      console.log('Upload KYC documents request received');
      console.log('User:', req.user);
      console.log('Files:', req.files);

      if (!req.files || (!req.files.front && !req.files.back)) {
        console.log('No files uploaded');
        return res.status(400).json({ message: 'Please upload document images' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize identity_document_images if it doesn't exist
      if (!user.identity_document_images) {
        user.identity_document_images = {};
      }

      // Update document image fields
      if (req.files.front) {
        user.identity_document_images.front = req.files.front[0].path;
      }
      
      if (req.files.back) {
        user.identity_document_images.back = req.files.back[0].path;
      }
      
      await user.save();

      console.log('Upload successful. New documents:', user.identity_document_images);
      res.json({ 
        urls: {
          front: user.identity_document_images.front,
          back: user.identity_document_images.back
        },
        message: 'KYC documents uploaded successfully' 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update KYC information
  updateKyc: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update KYC fields if provided
      if (req.body.identity_document_type) {
        user.identity_document_type = req.body.identity_document_type;
      }
      
      if (req.body.identity_document_number) {
        user.identity_document_number = req.body.identity_document_number;
      }
      
      if (req.body.identity_document_images) {
        // Initialize if it doesn't exist
        if (!user.identity_document_images) {
          user.identity_document_images = {};
        }
        
        // Update only the provided fields
        if (req.body.identity_document_images.front) {
          user.identity_document_images.front = req.body.identity_document_images.front;
        }
        
        if (req.body.identity_document_images.back) {
          user.identity_document_images.back = req.body.identity_document_images.back;
        }
      }
      
      // Update bank account information
      if (req.body.bank_account_name) {
        user.bank_account_name = req.body.bank_account_name;
      }
      
      if (req.body.bank_account_number) {
        user.bank_account_number = req.body.bank_account_number;
      }
      
      if (req.body.bank_name) {
        user.bank_name = req.body.bank_name;
      }
      
      // Update KYC status
      if (req.body.kyc_status) {
        user.kyc_status = req.body.kyc_status;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        identity_document_type: updatedUser.identity_document_type,
        identity_document_number: updatedUser.identity_document_number,
        identity_document_images: updatedUser.identity_document_images,
        bank_account_name: updatedUser.bank_account_name,
        bank_account_number: updatedUser.bank_account_number,
        bank_name: updatedUser.bank_name,
        kyc_status: updatedUser.kyc_status,
        message: 'KYC information updated successfully'
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add vehicle to favorites
  addToFavorites: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const vehicleId = req.params.vehicleId;

      // Check if already in favorites
      if (user.favorites.includes(vehicleId)) {
        return res.status(400).json({ message: 'Vehicle already in favorites' });
      }

      user.favorites.push(vehicleId);
      await user.save();

      res.json({ message: 'Vehicle added to favorites', favorites: user.favorites });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Remove vehicle from favorites
  removeFromFavorites: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const vehicleId = req.params.vehicleId;

      // Filter out the vehicle ID from favorites
      user.favorites = user.favorites.filter(
        fav => fav.toString() !== vehicleId
      );
      
      await user.save();

      res.json({ message: 'Vehicle removed from favorites', favorites: user.favorites });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = userController; 