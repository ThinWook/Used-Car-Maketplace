const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tất cả các route yêu cầu đăng nhập
router.use(protect);

// Thêm xe vào danh sách yêu thích
router.post('/:vehicleId', favoriteController.addToFavorites);

// Xóa xe khỏi danh sách yêu thích
router.delete('/:vehicleId', favoriteController.removeFromFavorites);

// Lấy danh sách xe yêu thích của người dùng hiện tại
router.get('/', favoriteController.getUserFavorites);

// Kiểm tra trạng thái yêu thích của xe
router.get('/check/:vehicleId', favoriteController.checkFavoriteStatus);

module.exports = router; 