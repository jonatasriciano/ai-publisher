const Post = require('../models/postModel');

/**
 * Create a new post
 * @param {Object} postData - The data required to create a new post.
 * @param {string} postData.userId - ID of the user creating the post.
 * @param {string} postData.platform - Platform for the post (e.g., LinkedIn, Twitter).
 * @param {string} postData.filePath - Path to the uploaded file.
 * @param {string} postData.caption - Caption for the post.
 * @param {string} postData.description - Description for the post.
 * @param {Array} postData.tags - Tags associated with the post.
 * @returns {Object} The saved post document.
 */
const createPost = async ({ userId, platform, filePath, caption, description, tags }) => {
  try {
    const post = new Post({
      userId,
      platform,
      filePath,
      caption,
      description,
      tags,
      status: 'pending',
    });

    const savedPost = await post.save();
    return savedPost;
  } catch (error) {
    console.error('[CreatePost] Error creating post:', error.message);
    throw new Error('Failed to create post');
  }
};

/**
 * Get all posts for a specific user
 * @param {string} userId - The ID of the user whose posts should be retrieved.
 * @returns {Array} List of posts for the user, sorted by creation date.
 */
const getPostsForUser = async (userId) => {
  try {
    return await Post.find({ userId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email');
  } catch (error) {
    console.error('[GetPostsForUser] Error retrieving posts:', error.message);
    throw new Error('Failed to fetch posts for user');
  }
};

/**
 * Get a single post by its ID
 * @param {string} postId - The ID of the post to retrieve.
 * @returns {Object|null} The post document, or null if not found.
 */
const getPostByIdFromDB = async (postId) => {
  try {
    const post = await Post.findById(postId).populate('userId', 'name email');
    return post;
  } catch (error) {
    console.error('[GetPostByIdFromDB] Error fetching post by ID:', error.message);
    throw new Error('Failed to fetch post by ID');
  }
};

module.exports = {
  createPost,
  getPostsForUser,
  getPostByIdFromDB,
};