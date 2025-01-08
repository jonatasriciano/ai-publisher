const { createPost, getPostsForUser } = require('../services/postService');
const { generateCaptionAndTags } = require('../services/llmService');

/**
 * Create a new post
 */
exports.uploadPost = async (req, res) => {
  try {
    // Validate if file and body are provided
    if (!req.file) {
      console.error('[Upload Error] File not provided');
      return res.status(400).json({ error: 'File not provided' });
    }

    if (!req.body) {
      console.error('[Upload Error] Body not provided');
      return res.status(400).json({ error: 'Body not provided' });
    }

    // Generate description and tags using the LLM
    let llmResponse = {};
    try {
      llmResponse = await generateCaptionAndTags(req.file, req.body);
    } catch (llmError) {
      console.error('[LLM Error] Failed to generate description and tags:', llmError.message);
      return res.status(500).json({
        error: 'Failed to generate description and tags',
        details: llmError.message,
      });
    }

    // Create post with generated description and tags
    const post = await createPost({
      userId: req.user.userId,
      platform: req.body.platform,
      filePath: req.file.path,
      caption: llmResponse.caption,
      description: llmResponse.description,
      tags: llmResponse.tags,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('[Upload Error] Failed to upload post:', error.message);
    res.status(500).json({ error: 'Failed to upload post', details: error.message });
  }
};

/**
 * Get all posts for the authenticated user
 */
exports.getPosts = async (req, res) => {
  try {
    // Validate the user ID
    if (!req.user || !req.user.userId) {
      console.error('[GetPosts Error] User ID missing from request');
      return res.status(400).json({ error: 'User ID missing from request' });
    }

    // Fetch posts for the user
    const posts = await getPostsForUser(req.user.userId);
    res.status(200).json(posts);
  } catch (error) {
    console.error('[GetPosts Error] Failed to fetch posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
};