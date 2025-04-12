const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Tất cả các routes đều yêu cầu xác thực
router.use(protect);

// Lấy danh sách thông báo của người dùng
router.get('/', notificationController.getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// Đánh dấu một thông báo đã đọc
router.patch('/:id/read', notificationController.markNotificationAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

module.exports = router; 