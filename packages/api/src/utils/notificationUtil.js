const notificationService = require('../services/notificationService');

/**
 * Gửi thông báo xe được duyệt
 * @param {Object} vehicle - Đối tượng xe
 * @param {string} userId - ID của người dùng sở hữu xe
 */
const sendVehicleApprovedNotification = async (vehicle, userId) => {
  try {
    await notificationService.createNotification(
      userId,
      'Tin đăng đã được duyệt',
      `Tin đăng "${vehicle.title}" của bạn đã được duyệt và hiển thị công khai.`,
      'vehicle_approved',
      {
        reference_id: vehicle._id,
        reference_model: 'Vehicle',
        link: `/vehicles/${vehicle._id}`
      }
    );
  } catch (error) {
    console.error('Lỗi khi gửi thông báo xe được duyệt:', error);
  }
};

/**
 * Gửi thông báo xe bị từ chối
 * @param {Object} vehicle - Đối tượng xe
 * @param {string} userId - ID của người dùng sở hữu xe
 * @param {string} reason - Lý do từ chối (tùy chọn)
 */
const sendVehicleRejectedNotification = async (vehicle, userId, reason = '') => {
  try {
    const message = reason 
      ? `Tin đăng "${vehicle.title}" của bạn đã bị từ chối. Lý do: ${reason}`
      : `Tin đăng "${vehicle.title}" của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin.`;
    
    await notificationService.createNotification(
      userId,
      'Tin đăng bị từ chối',
      message,
      'vehicle_rejected',
      {
        reference_id: vehicle._id,
        reference_model: 'Vehicle',
        link: `/my-vehicles`
      }
    );
  } catch (error) {
    console.error('Lỗi khi gửi thông báo xe bị từ chối:', error);
  }
};

/**
 * Gửi thông báo tin nhắn mới
 * @param {string} receiverId - ID của người nhận thông báo
 * @param {string} senderName - Tên người gửi tin nhắn
 * @param {string} chatId - ID của cuộc trò chuyện
 * @param {string} messageContent - Nội dung tin nhắn (sẽ được rút gọn)
 */
const sendNewMessageNotification = async (receiverId, senderName, chatId, messageContent) => {
  try {
    // Rút gọn nội dung tin nhắn nếu quá dài
    const shortContent = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;
    
    await notificationService.createNotification(
      receiverId,
      'Tin nhắn mới',
      `${senderName}: ${shortContent}`,
      'new_message',
      {
        reference_id: chatId,
        reference_model: 'Chat',
        link: `/chat/${chatId}`
      }
    );
  } catch (error) {
    console.error('Lỗi khi gửi thông báo tin nhắn mới:', error);
  }
};

/**
 * Gửi thông báo hệ thống đến người dùng
 * @param {string} userId - ID của người dùng nhận thông báo
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} link - Đường dẫn (tùy chọn)
 */
const sendSystemNotification = async (userId, title, message, link = null) => {
  try {
    await notificationService.createNotification(
      userId,
      title,
      message,
      'system',
      link ? { link } : {}
    );
  } catch (error) {
    console.error('Lỗi khi gửi thông báo hệ thống:', error);
  }
};

/**
 * Gửi thông báo hệ thống đến nhiều người dùng
 * @param {Array<string>} userIds - Danh sách ID người dùng
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} link - Đường dẫn (tùy chọn)
 */
const sendBulkSystemNotification = async (userIds, title, message, link = null) => {
  try {
    const notifications = userIds.map(userId => {
      return notificationService.createNotification(
        userId,
        title,
        message,
        'system',
        link ? { link } : {}
      );
    });
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Lỗi khi gửi thông báo hàng loạt:', error);
  }
};

module.exports = {
  sendVehicleApprovedNotification,
  sendVehicleRejectedNotification,
  sendNewMessageNotification,
  sendSystemNotification,
  sendBulkSystemNotification
}; 