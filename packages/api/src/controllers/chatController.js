const chatService = require('../services/chatService');
const notificationUtil = require('../utils/notificationUtil');

const chatController = {
  // Create a new chat
  createChat: async (req, res) => {
    try {
      const { vehicleId, sellerId } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!vehicleId) {
        return res.status(400).json({ message: 'vehicleId là bắt buộc' });
      }
      
      if (!sellerId) {
        return res.status(400).json({ message: 'sellerId là bắt buộc' });
      }
      
      // Log để debug
      console.log('Creating chat with data:', { 
        vehicleId, 
        sellerId, 
        currentUserId: req.user._id 
      });
      
      const chat = await chatService.createChat([req.user._id, sellerId], vehicleId);
      res.status(201).json(chat);
    } catch (error) {
      console.error('Error in createChat:', error);
      res.status(400).json({ 
        message: error.message || 'Không thể tạo cuộc trò chuyện',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Get all chats for a user
  getUserChats: async (req, res) => {
    try {
      const chats = await chatService.getChatsByUser(req.user._id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get chat by ID
  getChatById: async (req, res) => {
    try {
      const chat = await chatService.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add a message to chat
  addMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const chatId = req.params.id;
      
      // Lấy thông tin chat trước khi thêm tin nhắn để biết người nhận
      const chatBefore = await chatService.getChatById(chatId);
      if (!chatBefore) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Thêm tin nhắn vào chat
      const chat = await chatService.addMessage(chatId, req.user._id, content);
      
      // Xác định người nhận thông báo (người không gửi tin nhắn này)
      const receiverId = chatBefore.participants.find(
        participant => participant._id.toString() !== req.user._id.toString()
      );
      
      // Nếu có người nhận, gửi thông báo cho họ
      if (receiverId) {
        await notificationUtil.sendNewMessageNotification(
          receiverId._id,
          req.user.full_name || 'Người dùng',
          chatId,
          content
        );
      }
      
      res.json(chat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (req, res) => {
    try {
      const chat = await chatService.markMessagesAsRead(req.params.id, req.user._id);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = chatController; 