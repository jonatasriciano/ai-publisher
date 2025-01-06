// /Users/jonatas/Documents/Projects/ai-publisher/backend/models/postModel.js
const mongoose = require('mongoose');

// Define the schema for posts
const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    index: true, // Indexed for faster queries
  },
  platform: {
    type: String,
    enum: ['LinkedIn', 'Twitter', 'Facebook'], // Allowed platforms
    required: true,
  },
  filePath: {
    type: String,
    required: true, // Required field for the uploaded file path
  },
  caption: {
    type: String,
    required: true, // Required caption for the post
    maxlength: 2000, // Maximum length of the caption
  },
  tags: [
    {
      type: String,
      maxlength: 100, // Maximum length for individual tags
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'team_approved', 'client_approved', 'published', 'rejected'], // Status options
    default: 'pending', // Default status
    index: true, // Indexed for faster filtering
  },
  aiGenerated: {
    caption: { type: Boolean, default: false }, // AI-generated caption flag
    tags: { type: Boolean, default: false }, // AI-generated tags flag
    provider: { type: String, enum: ['openai', 'gemini', null], default: null }, // AI provider
  },
  metadata: {
    views: { type: Number, default: 0, min: 0 }, // Post views
    likes: { type: Number, default: 0, min: 0 }, // Post likes
    shares: { type: Number, default: 0, min: 0 }, // Post shares
    engagement: { type: Number, default: 0, min: 0 }, // Calculated engagement
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Pre-save hook to calculate engagement
postSchema.pre('save', function (next) {
  console.log('[PostModel] Pre-save hook called. Current data:', this);
  this.metadata.engagement = this.metadata.likes + this.metadata.shares + this.metadata.views;
  console.log('[PostModel] Calculated engagement:', this.metadata.engagement);
  next();
});

// Compound index for userId and platform
postSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.model('Post', postSchema);