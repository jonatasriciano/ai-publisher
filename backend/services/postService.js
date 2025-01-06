const Post = require('../models/postModel');

/**
 * Create a new post entry in the database.
 * @param {Object} postData - The post data.
 * @param {String} postData.userId - ID of the user.
 * @param {String} postData.platform - Platform for the post (e.g., LinkedIn, Twitter).
 * @param {String} postData.filePath - Path of the uploaded file.
 * @param {String} postData.caption - Caption for the post.
 * @param {Array} postData.tags - Tags associated with the post.
 * @returns {Object} The saved post object.
 */
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
    status: 'pending', // Default status for a new post
  });

  const savedPost = await post.save();
  console.log('[CreatePost] Post saved:', savedPost);
  return savedPost;
};

/**
 * Get all posts for a specific user.
 * @param {String} userId - ID of the user.
 * @returns {Array} Array of posts sorted by creation date.
 */
const getPostsForUser = async (userId) => {
  console.log('[GetPostsForUser] Fetching posts for user:', userId);

  const posts = await Post.find({ userId }).sort({ createdAt: -1 });
  console.log('[GetPostsForUser] Posts retrieved:', posts);

  return posts;
};

module.exports = { createPost, getPostsForUser };