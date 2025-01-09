const Post = require('../models/postModel');
const { sendEmail } = require('./emailService');

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
    const post = await Post.findById(postId).populate('userId', 'email name');
    if (!post) {
      return null; // Post not found
    }

    // Update post status and metadata
    post.status = 'team_approved';
    post.metadata = {
      ...post.metadata,
      approvedBy,
    };

    const updatedPost = await post.save();

    // Send email notification to the uploader
    const emailSubject = 'Your Post Has Been Approved!';
    const emailHtml = `
      <h1>Congratulations, ${post.userId.name}!</h1>
      <p>Your post has been approved by our team. Here are the details:</p>
      <ul>
        <li><strong>Platform:</strong> ${post.platform}</li>
        <li><strong>Caption:</strong> ${post.caption}</li>
        <li><strong>Status:</strong> ${post.status}</li>
        <li><strong>Tags:</strong> ${post.tags.join(', ')}</li>
      </ul>
      <p>You can review your post <a href="${process.env.FRONTEND_URL}/approval/${postId}">here</a>.</p>
      <p>Thank you for contributing!</p>
    `;

    await sendEmail(post.userId.email, emailSubject, emailHtml);

    return updatedPost;
  } catch (error) {
    console.error('[ApprovePostById] Error approving post:', error.message);
    throw new Error('Failed to approve post');
  }
};

module.exports = {
  createPost,
  getPostsForUser,
  getPostByIdFromDB,
  updatePostInDB,
  approvePostById,
};