import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
  },
  pronunciationScore: {
    type: Number,
    default: 0,
  },
  grammarScore: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Compound index to quickly find user progress for a specific lesson
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
