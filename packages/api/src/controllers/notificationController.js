const notificationService = require('../services/notificationService');
const { errorResponse, successResponse } = require('../utils/responseUtil');

/**
 * Lấy danh sách thông báo của người dùng hiện tại
 * @route GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await notificationService.getUserNotifications(userId, page, limit);
    
    return successResponse(res, 'Lấy danh sách thông báo thành công', result);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thông báo:', error);
    return errorResponse(res, 'Không thể lấy danh sách thông báo', 500);
  }
};

/**
 * Đánh dấu một thông báo đã đọc
 * @route PATCH /api/notifications/:id/read
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await notificationService.markAsRead(notificationId);
    
    if (!notification) {
      return errorResponse(res, 'Không tìm thấy thông báo', 404);
    }
    
    return successResponse(res, 'Đánh dấu thông báo đã đọc thành công', notification);
  } catch (error) {
    console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    return errorResponse(res, 'Không thể đánh dấu thông báo đã đọc', 500);
  }
};

/**
 * Đánh dấu tất cả thông báo của người dùng hiện tại đã đọc
 * @route PATCH /api/notifications/read-all
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    
    return successResponse(res, 'Đánh dấu tất cả thông báo đã đọc thành công', {
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
    return errorResponse(res, 'Không thể đánh dấu tất cả thông báo đã đọc', 500);
  }
};

/**
 * Lấy số lượng thông báo chưa đọc của người dùng hiện tại
 * @route GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    
    return successResponse(res, 'Lấy số lượng thông báo chưa đọc thành công', { count });
  } catch (error) {
    console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
    return errorResponse(res, 'Không thể lấy số lượng thông báo chưa đọc', 500);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
}; 