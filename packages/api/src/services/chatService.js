const Chat = require('../models/Chat');
const User = require('../models/User');

class ChatService {
  async createChat(participants, vehicleId) {
    try {
      const existingChat = await Chat.findOne({
        participants: { $all: participants },
        vehicle: vehicleId
      });

      if (existingChat) {
        return existingChat;
      }

      const chat = new Chat({
        participants,
        vehicle: vehicleId
      });

      return await chat.save();
    } catch (error) {
      throw error;
    }
  }

  async getChatsByUser(userId) {
    try {
      return await Chat.find({ participants: userId })
        .populate('participants', 'full_name email avatar_url')
        .populate('vehicle', 'make model price')
        .sort({ lastMessage: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getChatById(chatId) {
    try {
      return await Chat.findById(chatId)
        .populate('participants', 'full_name email avatar_url')
        .populate('vehicle', 'make model price');
    } catch (error) {
      throw error;
    }
  }

  async addMessage(chatId, senderId, content) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      chat.messages.push({
        sender: senderId,
        content
      });

      chat.lastMessage = new Date();
      return await chat.save();
    } catch (error) {
      throw error;
    }
  }

  async markMessagesAsRead(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      chat.messages.forEach(message => {
        if (message.sender.toString() !== userId.toString() && !message.read) {
          message.read = true;
        }
      });

      return await chat.save();
    } catch (error) {
      throw error;
    }
  }

  async getConversationsByUser(userId) {
    try {
      return await Chat.find({ participants: userId })
        .populate('participants', 'full_name email avatar_url')
        .populate('vehicle', 'make model price')
        .sort({ updatedAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getConversationById(id) {
    try {
      return await Chat.findById(id)
        .populate('participants', 'full_name email avatar_url')
        .populate('vehicle', 'make model price');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ChatService(); 