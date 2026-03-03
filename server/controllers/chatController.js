const Message = require('../models/Message');
const User = require('../models/User');
const { canSendMessage } = require('../services/chatPermissionService');
const mongoose = require('mongoose');

// POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message_text } = req.body;
    if (!receiver_id || !message_text?.trim()) {
      return res.status(400).json({ message: 'receiver_id and message_text are required' });
    }

    const sender = req.user;
    const receiver = await User.findById(receiver_id).select('role department name').lean();
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const check = canSendMessage(sender, receiver);
    if (!check.allowed) return res.status(403).json({ message: check.reason });

    const msg = await Message.create({
      sender_id:    sender._id,
      sender_role:  sender.role,
      receiver_id:  receiver._id,
      receiver_role: receiver.role,
      department:   sender.department || receiver.department,
      message_text: message_text.trim(),
      status: 'sent'
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// GET /api/chat/conversation/:userId
exports.getConversation = async (req, res) => {
  try {
    const me = req.user._id;
    const other = mongoose.Types.ObjectId.isValid(req.params.userId)
      ? new mongoose.Types.ObjectId(req.params.userId)
      : null;
    if (!other) return res.status(400).json({ message: 'Invalid userId' });

    const messages = await Message.find({
      $or: [
        { sender_id: me, receiver_id: other },
        { sender_id: other, receiver_id: me }
      ]
    }).sort({ created_at: 1 }).lean();

    // Mark unread/unsent messages sent TO me as delivered
    const toDeliver = messages
      .filter(m => String(m.receiver_id) === String(me) && m.status === 'sent')
      .map(m => m._id);

    if (toDeliver.length > 0) {
      await Message.updateMany({ _id: { $in: toDeliver } }, { status: 'delivered' });
      messages.forEach(m => {
        if (toDeliver.map(String).includes(String(m._id))) m.status = 'delivered';
      });
    }

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching conversation', error: err.message });
  }
};

// GET /api/chat/list  — sidebar: one entry per conversation, latest message
exports.getChatList = async (req, res) => {
  try {
    const me = req.user._id;

    // All messages involving me
    const messages = await Message.find({
      $or: [{ sender_id: me }, { receiver_id: me }]
    }).sort({ created_at: -1 }).lean();

    // Build map: other user ID → latest message
    const convMap = {};
    messages.forEach(m => {
      const otherId = String(m.sender_id) === String(me)
        ? String(m.receiver_id)
        : String(m.sender_id);
      if (!convMap[otherId]) convMap[otherId] = m;
    });

    // Enrich with user info
    const otherIds = Object.keys(convMap);
    const users = await User.find({ _id: { $in: otherIds } }, 'name role department').lean();
    const userMap = {};
    users.forEach(u => { userMap[String(u._id)] = u; });

    // Count unread per conversation
    const unreadCounts = await Message.aggregate([
      { $match: { receiver_id: me, status: { $in: ['sent', 'delivered'] } } },
      { $group: { _id: '$sender_id', count: { $sum: 1 } } }
    ]);
    const unreadMap = {};
    unreadCounts.forEach(r => { unreadMap[String(r._id)] = r.count; });

    const list = otherIds.map(uid => ({
      user: userMap[uid] || { _id: uid, name: 'Unknown', role: 'unknown' },
      lastMessage: convMap[uid],
      unread: unreadMap[uid] || 0
    })).sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching chat list', error: err.message });
  }
};

// GET /api/chat/contacts — list of people I'm allowed to message
exports.getContacts = async (req, res) => {
  try {
    const me = req.user;
    let query = {};

    if (me.role === 'student') {
      // Can message mentors of own dept + welfare
      query = { $or: [
        { role: 'welfare' },
        { role: 'mentor', department: me.department }
      ]};
    } else if (me.role === 'mentor') {
      // Can message students of own dept + welfare
      query = { $or: [
        { role: 'welfare' },
        { role: 'student', department: me.department }
      ]};
    } else if (me.role === 'welfare') {
      // Can message everyone except self
      query = {};
    }

    const contacts = await User.find(
      { ...query, _id: { $ne: me._id } },
      'name role department'
    ).lean();

    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching contacts', error: err.message });
  }
};

// PATCH /api/chat/read/:messageId
exports.markRead = async (req, res) => {
  try {
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.messageId, receiver_id: req.user._id },
      { status: 'read' },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Error marking read', error: err.message });
  }
};

// PATCH /api/chat/delivered/:messageId
exports.markDelivered = async (req, res) => {
  try {
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.messageId, receiver_id: req.user._id, status: 'sent' },
      { status: 'delivered' },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: 'Message not found or already delivered' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Error marking delivered', error: err.message });
  }
};
