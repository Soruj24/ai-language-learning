import mongoose from 'mongoose';

const ConversationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [{
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
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  mode: {
    type: String,
    enum: ['casual', 'business', 'travel'],
    default: 'casual',
  },
  language: {
    type: String,
    required: true,
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

ConversationHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.ConversationHistory || mongoose.model('ConversationHistory', ConversationHistorySchema);
