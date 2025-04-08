const chatService = require('../services/chatService');

const chatController = {
  // Create a new chat
  createChat: async (req, res) => {
    try {
      const { vehicleId, sellerId } = req.body;
      const chat = await chatService.createChat([req.user._id, sellerId], vehicleId);
      res.status(201).json(chat);
    } catch (error) {
      res.status(400).json({ message: error.message });
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
      const chat = await chatService.addMessage(req.params.id, req.user._id, content);
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