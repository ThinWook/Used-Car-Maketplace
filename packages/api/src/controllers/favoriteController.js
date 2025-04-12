const Favorite = require('../models/Favorite');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

const favoriteController = {
  // Thêm xe vào danh sách yêu thích
  addToFavorites: async (req, res) => {
    try {
      console.log('=== START addToFavorites ===');
      
      // Lấy thông tin user và vehicle ID
      const userId = req.user._id;
      const vehicleId = req.params.vehicleId;
      
      console.log('User ID:', userId);
      console.log('Vehicle ID:', vehicleId);
      
      // Kiểm tra định dạng ObjectId của vehicle
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        console.log('Invalid Vehicle ID format');
        return res.status(400).json({ message: 'ID xe không hợp lệ' });
      }
      
      // Kiểm tra xe có tồn tại không
      const vehicleExists = await Vehicle.exists({ _id: vehicleId });
      if (!vehicleExists) {
        console.log('Vehicle not found');
        return res.status(404).json({ message: 'Không tìm thấy xe' });
      }
      
      // Kiểm tra đã thích xe này chưa
      const existingFavorite = await Favorite.findOne({ user: userId, vehicle: vehicleId });
      if (existingFavorite) {
        console.log('Vehicle already in favorites');
        return res.status(400).json({ message: 'Xe đã có trong danh sách yêu thích' });
      }
      
      // Tạo yêu thích mới
      const newFavorite = new Favorite({
        user: userId,
        vehicle: vehicleId
      });
      
      // Lưu vào database
      await newFavorite.save();
      console.log('Favorite saved successfully');
      
      // Đếm tổng số xe yêu thích của người dùng
      const favoriteCount = await Favorite.countDocuments({ user: userId });
      
      console.log('=== END addToFavorites ===');
      res.status(201).json({ 
        message: 'Đã thêm xe vào danh sách yêu thích', 
        favorite: newFavorite,
        favoriteCount
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      // Xử lý lỗi trùng lặp (nếu cố tình thêm trùng)
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Xe đã có trong danh sách yêu thích' });
      }
      
      res.status(400).json({ message: error.message });
    }
  },

  // Xóa xe khỏi danh sách yêu thích
  removeFromFavorites: async (req, res) => {
    try {
      console.log('=== START removeFromFavorites ===');
      
      // Lấy thông tin user và vehicle ID
      const userId = req.user._id;
      const vehicleId = req.params.vehicleId;
      
      console.log('User ID:', userId);
      console.log('Vehicle ID:', vehicleId);
      
      // Kiểm tra định dạng ObjectId của vehicle
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        console.log('Invalid Vehicle ID format');
        return res.status(400).json({ message: 'ID xe không hợp lệ' });
      }
      
      // Tìm và xóa khỏi danh sách yêu thích
      const favorite = await Favorite.findOneAndDelete({ user: userId, vehicle: vehicleId });
      
      if (!favorite) {
        console.log('Vehicle not in favorites');
        return res.status(404).json({ message: 'Xe không có trong danh sách yêu thích' });
      }
      
      console.log('Favorite removed successfully');
      
      // Đếm tổng số xe yêu thích của người dùng
      const favoriteCount = await Favorite.countDocuments({ user: userId });
      
      console.log('=== END removeFromFavorites ===');
      res.json({ 
        message: 'Đã xóa xe khỏi danh sách yêu thích',
        favoriteCount
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Lấy danh sách xe yêu thích của người dùng hiện tại
  getUserFavorites: async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Lấy danh sách yêu thích và populate thông tin xe
      const favorites = await Favorite.find({ user: userId })
        .populate('vehicle')
        .sort({ created_at: -1 });
      
      res.json({
        favorites: favorites.map(fav => fav.vehicle),
        count: favorites.length
      });
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Kiểm tra một xe có được yêu thích bởi người dùng hiện tại không
  checkFavoriteStatus: async (req, res) => {
    try {
      const userId = req.user._id;
      const vehicleId = req.params.vehicleId;
      
      // Kiểm tra định dạng ObjectId
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        return res.status(400).json({ message: 'ID xe không hợp lệ' });
      }
      
      // Kiểm tra trong database
      const favorite = await Favorite.findOne({ user: userId, vehicle: vehicleId });
      
      res.json({
        isFavorite: !!favorite
      });
    } catch (error) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = favoriteController; 