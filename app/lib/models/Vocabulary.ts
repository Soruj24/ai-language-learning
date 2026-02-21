import mongoose from 'mongoose';

const VocabularySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  word: {
    type: String,
    required: true,
  },
  meaning: {
    type: String,
    required: true,
  },
  example: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  nextReviewDate: {
    type: Date,
    default: Date.now,
  },
  // Spaced Repetition fields (SM-2 Algorithm)
  interval: {
    type: Number,
    default: 0,
  },
  repetition: {
    type: Number,
    default: 0,
  },
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficiently querying due vocabulary items
VocabularySchema.index({ userId: 1, nextReviewDate: 1 });

export default mongoose.models.Vocabulary || mongoose.model('Vocabulary', VocabularySchema);
