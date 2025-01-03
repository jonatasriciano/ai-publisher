const { createPost, getPostsForUser } = require('../services/postService');

/**
 * Create a new post
 */
exports.uploadPost = async (req, res) => {
  try {
    const post = await createPost({
      userId: req.user.userId,
      platform: req.body.platform,
      filePath: req.file.path,
      caption: req.body.caption,
      tags: req.body.tags ? req.body.tags.split(',') : [],
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all posts for the authenticated user
 */
exports.getPosts = async (req, res) => {
  try {
    const posts = await getPostsForUser(req.user.userId);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};