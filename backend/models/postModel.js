const mongoose = require('mongoose');

// Define the schema for posts
const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['LinkedIn', 'Twitter', 'Facebook'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true,
    maxlength: 2000
  },
  tags: [{
    type: String,
    maxlength: 100
  }],
  status: {
    type: String,
    enum: ['pending', 'team_approved', 'client_approved', 'published', 'rejected'],
    default: 'pending',
    index: true
  },
  aiGenerated: {
    caption: { type: Boolean, default: false },
    tags: { type: Boolean, default: false },
    provider: { type: String, enum: ['openai', 'gemini', null], default: null }
  },
  metadata: {
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    engagement: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true
});

/**
 * Pre-save hook to calculate engagement based on metadata
 */
postSchema.pre('save', function (next) {
  this.metadata.engagement = this.metadata.likes + this.metadata.shares + this.metadata.views;
  next();
});

// Add compound index for optimized queries
postSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.model('Post', postSchema);