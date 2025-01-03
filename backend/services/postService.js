const Post = require('../models/postModel');

/**
 * Create a new post
 */
const createPost = async ({ userId, platform, filePath, caption, tags }) => {
  const post = new Post({
    userId,
    platform,
    filePath,
    caption,
    tags,
    status: 'pending',
  });
  return await post.save();
};

/**
 * Get all posts for a user
 */
const getPostsForUser = async (userId) => {
  return await Post.find({ userId }).sort({ createdAt: -1 });
};

module.exports = { createPost, getPostsForUser };