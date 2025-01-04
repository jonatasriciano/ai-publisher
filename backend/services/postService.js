const Post = require('../models/postModel');

const createPost = async ({ userId, platform, filePath, caption, tags }) => {
  console.log('[CreatePost] Creating post with data:', {
    userId,
    platform,
    filePath,
    caption,
    tags,
  });

  const post = new Post({
    userId,
    platform,
    filePath,
    caption,
    tags,
    status: 'pending',
  });

  const savedPost = await post.save();
  console.log('[CreatePost] Post saved:', savedPost);
  return savedPost;
};

/**
 * Get all posts for a user
 */
const getPostsForUser = async (userId) => {
  return await Post.find({ userId }).sort({ createdAt: -1 });
};

module.exports = { createPost, getPostsForUser };