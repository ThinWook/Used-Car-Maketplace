const Chat = require('../models/Chat');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

class ChatService {
  async createChat(participants, vehicleId) {
    try {
      // Kiểm tra participants
      if (!Array.isArray(participants) || participants.length !== 2) {
        throw new Error('Participants phải là một mảng chứa đúng 2 ID người dùng');
      }

      // Kiểm tra tính hợp lệ của ID
      participants.forEach(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`ID người dùng không hợp lệ: ${id}`);
        }
      });

      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new Error(`ID phương tiện không hợp lệ: ${vehicleId}`);
      }

      // Kiểm tra xem người dùng có tồn tại không
      const users = await User.find({ _id: { $in: participants } });
      if (users.length !== 2) {
        throw new Error('Một hoặc cả hai người dùng không tồn tại');
      }

      // Kiểm tra xem phương tiện có tồn tại không
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new Error(`Không tìm thấy phương tiện với ID: ${vehicleId}`);
      }

      // Tìm cuộc trò chuyện hiện có
      const existingChat = await Chat.findOne({
        participants: { $all: participants },
        vehicle: vehicleId
      });

      if (existingChat) {
        return existingChat;
      }

      // Tạo cuộc trò chuyện mới
      const chat = new Chat({
        participants,
        vehicle: vehicleId
      });

      return await chat.save();
    } catch (error) {
      console.error('Error in createChat service:', error);
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