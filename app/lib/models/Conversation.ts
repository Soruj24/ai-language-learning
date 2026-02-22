import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  corrections: [{
    original: String,
    correction: String,
    explanation: String,
  }],
  translation: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New Conversation',
  },
  messages: [MessageSchema],
  mode: {
    type: String,
    default: 'casual',
  },
  language: {
    type: String,
    default: 'Spanish',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next;
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
