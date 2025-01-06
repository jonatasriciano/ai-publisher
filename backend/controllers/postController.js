// postController.js
const { createPost, getPostsForUser } = require('../services/postService');
const path = require('path');

/**
 * Create a new post
 */
exports.uploadPost = async (req, res) => {
  try {
    console.log('[Upload] File:', req.file);
    console.log('[Upload] Body:', req.body);

    if (!req.file) {
      console.error('[Upload] File not provided');
      return res.status(400).json({ error: 'File not provided' });
    }

    const post = await createPost({
      userId: req.user.userId,
      platform: req.body.platform,
      filePath: req.file.path,
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