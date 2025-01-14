const Post = require('../models/postModel');
const { sendEmail, templates } = require('./emailService');
const path = require('path');
const fs = require('fs');

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

const updatePostInDB = async (postId, updateData) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: updateData }, // Use $set to update only specified fields
      { new: true, runValidators: true } // Return the updated document and validate input
    );

    return updatedPost;
  } catch (error) {
    console.error('[UpdatePostInDB] Error updating post:', error.message);
    throw new Error('Failed to update post');
  }
};

const approvePostById = async (postId, approvedBy) => {
  try {
    // Retrieve the post and populate uploader's email and name
    const post = await Post.findById(postId).populate('userId', 'email name');
    if (!post || !post.userId || !post.userId.email) {
      throw new Error('Email not found for the uploader');
    }

    console.log(`[ApprovePostById] Post found for email: ${post.userId.email}`);

    // Update post status and metadata
    post.status = 'team_approved';
    post.metadata = {
      ...post.metadata,
      approvedBy,
    };

    const updatedPost = await post.save();

    // Send email using the generated template
    await sendEmail({
      to: post.userId.email,
      ...templates.postApproval(), // Removed unnecessary verificationToken
    });

    console.log(`[ApprovePostById] Email sent successfully to ${post.userId.email}`);
    return updatedPost;
  } catch (error) {
    console.error('[ApprovePostById] Error approving post:', error.message);
    throw new Error('Failed to approve post');
  }
};

const deletePostById = async (postId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      return null; // Post not found
    }

    // Delete associated file if it exists
    if (post.filePath) {
      const fullPath = path.join(__dirname, '../uploads', post.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); // Remove file
      }
    }

    // Delete post from the database
    return await Post.findByIdAndDelete(postId);
  } catch (error) {
    console.error('[DeletePostById] Error deleting post:', error.message);
    throw new Error('Failed to delete post');
  }
};

module.exports = {
  createPost,
  getPostsForUser,
  getPostByIdFromDB,
  updatePostInDB,
  approvePostById,
  deletePostById
};