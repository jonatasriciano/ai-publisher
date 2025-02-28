const Post = require('../models/postModel');
const { sendEmail, templates } = require('./emailService');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { analyzeImageAndText } = require('./llmService');

const INSTAGRAM_API_URL = 'https://graph.instagram.com/me/media';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

/**
 * Fetch Instagram feed using the Graph API.
 * @returns {Array} List of media objects from the feed.
 */
const fetchInstagramFeed = async () => {
  try {
    const response = await axios.get(INSTAGRAM_API_URL, {
      params: {
        fields: 'id,caption,media_url',
        access_token: ACCESS_TOKEN,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('[FetchInstagramFeed] Error fetching Instagram feed:', error.message);
    return [];
  }
};

/**
 * Post a comment on an Instagram post
 * @param {string} mediaId - The Instagram media ID.
 * @param {string} comment - The comment to post.
 * @returns {Object|null} Response from the API.
 */
const postComment = async (mediaId, comment) => {
  try {
    const INSTAGRAM_COMMENT_API = `https://graph.facebook.com/v18.0/${mediaId}/comments`;

    const response = await axios.post(INSTAGRAM_COMMENT_API, {
      message: comment,
      access_token: ACCESS_TOKEN,
    });

    return response.data;
  } catch (error) {
    console.error('[PostComment] Error posting comment:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Automatically generate and post AI-powered comments on Instagram feed
 * @returns {Object} Success message or error message.
 */
const autoCommentOnFeed = async () => {
  try {
    const posts = await fetchInstagramFeed();

    for (const post of posts) {
      const comment = await analyzeImageAndText(post.media_url, post.caption);
      await postComment(post.id, comment);
      console.log(`[AutoComment] AI Comment Posted: ${comment}`);
    }

    return { success: true, message: 'AI-generated comments have been posted!' };
  } catch (error) {
    console.error('[AutoComment] Error:', error.message);
    throw new Error('Error processing AI comments');
  }
};

/**
 * Create a new post
 * @param {Object} postData - The data required to create a new post.
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

    return await post.save();
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
    return await Post.find({ userId }).sort({ createdAt: -1 }).populate('userId', 'name email');
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
    return await Post.findById(postId).populate('userId', 'name email');
  } catch (error) {
    console.error('[GetPostByIdFromDB] Error fetching post by ID:', error.message);
    throw new Error('Failed to fetch post by ID');
  }
};

/**
 * Update a post in the database
 * @param {string} postId - The ID of the post to update.
 * @param {Object} updateData - The data to update in the post.
 * @returns {Object|null} The updated post document, or null if not found.
 */
const updatePostInDB = async (postId, updateData) => {
  try {
    return await Post.findByIdAndUpdate(
      postId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('[UpdatePostInDB] Error updating post:', error.message);
    throw new Error('Failed to update post');
  }
};

/**
 * Approve a post by its ID and notify the user via email
 * @param {string} postId - The ID of the post to approve.
 * @param {string} approvedBy - The user ID of the approver.
 * @returns {Object|null} The updated post document, or null if not found.
 */
const approvePostById = async (postId, approvedBy) => {
  try {
    const post = await Post.findById(postId).populate('userId', 'email name');
    if (!post || !post.userId || !post.userId.email) {
      throw new Error('Email not found for the uploader');
    }

    console.log(`[ApprovePostById] Post found for email: ${post.userId.email}`);

    post.status = 'team_approved';
    post.metadata = { ...post.metadata, approvedBy };

    const updatedPost = await post.save();

    await sendEmail({
      to: post.userId.email,
      ...templates.postApproval(),
    });

    console.log(`[ApprovePostById] Email sent successfully to ${post.userId.email}`);
    return updatedPost;
  } catch (error) {
    console.error('[ApprovePostById] Error approving post:', error.message);
    throw new Error('Failed to approve post');
  }
};

/**
 * Delete a post and its associated file
 * @param {string} postId - The ID of the post to delete.
 * @returns {Object|null} The deleted post document, or null if not found.
 */
const deletePostById = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) return null;

    if (post.filePath) {
      const fullPath = path.join(__dirname, '../uploads', post.filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    return await Post.findByIdAndDelete(postId);
  } catch (error) {
    console.error('[DeletePostById] Error deleting post:', error.message);
    throw new Error('Failed to delete post');
  }
};

module.exports = {
  fetchInstagramFeed, // Now part of postService.js
  postComment,
  autoCommentOnFeed,
  createPost,
  getPostsForUser,
  getPostByIdFromDB,
  updatePostInDB,
  approvePostById,
  deletePostById,
};
