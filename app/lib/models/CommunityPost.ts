import mongoose from 'mongoose';

const CommunityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: String, // Cache author name for easier display
  type: {
    type: String,
    enum: ['discussion', 'group', 'correction', 'resource'],
    required: true,
  },
  title: String, // For groups, resources
  content: String, // For discussions, groups description
  
  // Specific fields for corrections
  originalText: String,
  correctedText: String,
  explanation: String,
  
  // Specific fields for resources
  resourceType: String, // PDF, Video, etc.
  link: String,
  
  // Specific fields for groups
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberCount: { type: Number, default: 0 },
  
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0 },
  
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  commentCount: { type: Number, default: 0 },
  
  category: String, // Tag/Category
  language: String, // Target language
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.CommunityPost || mongoose.model('CommunityPost', CommunityPostSchema);
