const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Chat routes
router.post('/', chatController.createChat);
router.get('/', chatController.getUserChats);
router.get('/:id', chatController.getChatById);
router.post('/:id/messages', chatController.addMessage);
router.put('/:id/read', chatController.markMessagesAsRead);

module.exports = router; 