import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'teacher'],
    default: 'student',
  },
  languageLearning: {
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Bengali'],
    default: 'Spanish',
  },
  interfaceLanguage: {
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Bengali'],
    default: 'English',
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  nativeLanguage: {
    type: String,
    default: 'English',
  },
  xpPoints: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  wordsLearned: {
    type: Number,
    default: 0,
  },
  lessonsCompleted: {
    type: Number,
    default: 0,
  },
  pronunciationScore: {
    type: Number,
    default: 0,
  },
  grammarAccuracy: {
    type: Number,
    default: 0,
  },
  speakingTime: {
    type: Number,
    default: 0, // in minutes
  },
  weeklyProgress: [{
    day: String, // e.g., "Mon"
    minutes: Number,
  }],
  achievements: [{
    id: String,
    name: String,
    date: {
      type: Date,
      default: Date.now,
    }
  }],
  image: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true,
  },
  learningGoal: {
    type: String,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  learningPlan: [{
    day: Number,
    title: String,
    activities: [String],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  flashcards: [{
    front: String,
    back: String,
    context: String,
    nextReview: {
      type: Date,
      default: Date.now,
    },
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
    mistakeCount: {
      type: Number,
      default: 0,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
