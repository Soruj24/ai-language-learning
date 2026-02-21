import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Bengali'],
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  topic: {
    type: String,
    required: true,
  },
  vocabulary: [{
    word: String,
    meaning: String,
    pronunciation: String,
  }],
  grammarRules: [{
    rule: String,
    explanation: String,
  }],
  examples: [{
    sentence: String,
    translation: String,
  }],
  exercises: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'fill-in-blank', 'matching'],
    },
    question: String,
    options: [String],
    correctAnswer: String,
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster querying
LessonSchema.index({ language: 1, level: 1 });
LessonSchema.index({ topic: 1 });

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
