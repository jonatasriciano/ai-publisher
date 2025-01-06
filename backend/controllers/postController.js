// /Users/jonatas/Documents/Projects/ai-publisher/backend/controllers/postController.js
const { createPost, getPostsForUser } = require('../services/postService');
const path = require('path');

/**
 * Create a new post
 */
exports.uploadPost = async (req, res) => {
  try {
    console.log('[Upload] File:', req.files);
    console.log('[Upload] Body:', req.body);

    // Check if a file was uploaded
    if (!req.files || !req.files.file) {
      console.error('[Upload] File not provided');
      return res.status(400).json({ error: 'File not provided' });
    }

    const file = req.files.file;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error('[Upload] Invalid file type:', file.mimetype);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Generate a unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
    const uploadPath = path.join(__dirname, '../uploads', filename);

    // Move the file to the uploads directory
    await file.mv(uploadPath);
    console.log('[Upload] File saved at:', uploadPath);

    // Create the post entry
    const post = await createPost({
      userId: req.user.userId,
      platform: req.body.platform,
      filePath: uploadPath,
      caption: req.body.caption,
      tags: req.body.tags ? req.body.tags.split(',') : [],
    });

    console.log('[Upload] Post created:', post);
    res.status(201).json(post);
  } catch (error) {
    console.error('[Upload] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all posts for the authenticated user
 */
exports.getPosts = async (req, res) => {
  try {
    // Validate the user ID
    if (!req.user || !req.user.userId) {
      console.error('[GetPosts] User ID missing from request');
      return res.status(400).json({ error: 'User ID missing from request' });
    }

    console.log('[GetPosts] Fetching posts for user:', req.user.userId);

    // Fetch posts for the user
    const posts = await getPostsForUser(req.user.userId);

    console.log('[GetPosts] Posts retrieved:', posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error('[GetPosts] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};