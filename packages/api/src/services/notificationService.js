const Notification = require('../models/Notification');

/**
 * Gửi thông báo đến người dùng
 * @param {string} userId - ID của người dùng nhận thông báo
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo
 * @param {Object} options - Các tùy chọn bổ sung (reference_id, reference_model, link)
 * @returns {Promise<Notification>} Đối tượng thông báo đã được tạo
 */
const createNotification = async (userId, title, message, type, options = {}) => {
  try {
    const { reference_id, reference_model, link } = options;
    
    const notification = new Notification({
      user_id: userId,
      title,
      message,
      type,
      reference_id,
      reference_model,
      link
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    throw error;
  }
};

/**
 * Lấy danh sách thông báo của người dùng
 * @param {string} userId - ID của người dùng
 * @param {number} page - Số trang
 * @param {number} limit - Số thông báo trên mỗi trang
 * @returns {Promise<Object>} Đối tượng chứa danh sách thông báo và thông tin phân trang
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ user_id: userId });
    
    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thông báo:', error);
    throw error;
  }
};

/**
 * Đánh dấu thông báo đã đọc
 * @param {string} notificationId - ID của thông báo
 * @returns {Promise<Notification>} Đối tượng thông báo đã được cập nhật
 */
const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { is_read: true },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả thông báo của người dùng đã đọc
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} Kết quả cập nhật
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
    
    return result;
  } catch (error) {
    console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
    throw error;
  }
};

/**
 * Lấy số lượng thông báo chưa đọc của người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Promise<number>} Số lượng thông báo chưa đọc
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ user_id: userId, is_read: false });
    return count;
  } catch (error) {
    console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
}; 