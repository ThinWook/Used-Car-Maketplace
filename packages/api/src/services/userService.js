const User = require('../models/User');
const jwt = require('jsonwebtoken');

class UserService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await User.findById(id).select('-password');
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      return await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });
      
      if (!user || !(await user.matchPassword(password))) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async addToFavorites(userId, vehicleId) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: vehicleId } },
        { new: true }
      ).select('-password');
    } catch (error) {
      throw error;
    }
  }

  async removeFromFavorites(userId, vehicleId) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: vehicleId } },
        { new: true }
      ).select('-password');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService(); 