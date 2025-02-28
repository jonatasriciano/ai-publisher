const {
  createPost,
  getPostsForUser,
  getPostByIdFromDB,
  updatePostInDB,
  approvePostById,
  deletePostById,
} = require('../services/postService');

const { generateCaptionAndTags, analyzeImageAndText } = require('../services/llmService');

/**
 * Create a new post
 */
exports.uploadPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File not provided' });
    }

    if (!req.body) {
      return res.status(400).json({ error: 'Body not provided' });
    }

    let llmResponse = {};
    try {
      llmResponse = await generateCaptionAndTags(req.file, req.body);
    } catch (llmError) {
      return res.status(500).json({
        error: 'Failed to generate description and tags',
        details: llmError.message,
      });
    }

    const post = await createPost({
      userId: req.user.userId,
      platform: req.body.platform,
      filePath: req.file.path,
      guidelines: req.body.guidelines,
      caption: llmResponse.caption,
      description: llmResponse.description,
      tags: llmResponse.tags,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload post', details: error.message });
  }
};

/**
 * Get all posts for the authenticated user
 */
exports.getPosts = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ error: 'User ID missing from request' });
    }

    const posts = await getPostsForUser(req.user.userId);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
};

/**
 * Get a specific post by ID
 */
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = await getPostByIdFromDB(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('[GetPostById] Error fetching post:', error.message);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

/**
 * Update a post by ID
 */
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform, caption, tags, description } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const updatedPost = await updatePostInDB(postId, {
      platform,
      caption,
      tags,
      description,
    });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('[UpdatePost] Error updating post:', error.message);
    res.status(500).json({ error: 'Failed to update post', details: error.message });
  }
};

/**
 * Approve a post by ID
 */
exports.approvePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const updatedPost = await approvePostById(postId, req.user.userId);
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('[ApprovePost] Error:', error.message);
    res.status(500).json({ error: 'Failed to approve post' });
  }
};

/**
 * Delete a post by ID
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const deletedPost = await deletePostById(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('[DeletePost] Error deleting post:', error.message);
    res.status(500).json({ error: 'Failed to delete post', details: error.message });
  }
};

/**
 * AI-Powered Auto Commenting for Instagram Feed
 */
exports.autoCommentOnFeed = async (req, res) => {
  try {
    const posts = await fetchInstagramFeed();

    for (const post of posts) {
      const comment = await analyzeImageAndText(post.media_url, post.caption);
      await postComment(post.id, comment);
      console.log(`[AutoComment] AI Comment Posted: ${comment}`);
    }

    res.json({ success: true, message: 'AI-generated comments have been posted!' });
  } catch (error) {
    console.error('[AutoComment] Error:', error.message);
    res.status(500).json({ success: false, message: 'Error processing AI comments.' });
  }
};
