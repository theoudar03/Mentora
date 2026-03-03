const express = require('express');
const {
  sendMessage,
  getConversation,
  getChatList,
  getContacts,
  markRead,
  markDelivered
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All chat routes require login
router.use(protect);

router.post('/send', sendMessage);
router.get('/list', getChatList);
router.get('/contacts', getContacts);
router.get('/conversation/:userId', getConversation);
router.patch('/read/:messageId', markRead);
router.patch('/delivered/:messageId', markDelivered);

module.exports = router;
