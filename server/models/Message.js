const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender_role:  { type: String, enum: ['student', 'mentor', 'welfare'], required: true },
  receiver_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_role:{ type: String, enum: ['student', 'mentor', 'welfare'], required: true },
  department:   { type: String },
  message_text: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  created_at: { type: Date, default: Date.now }
});

// Index for fast conversation lookups
messageSchema.index({ sender_id: 1, receiver_id: 1, created_at: 1 });
messageSchema.index({ receiver_id: 1, status: 1 });

module.exports = mongoose.model('Message', messageSchema);
