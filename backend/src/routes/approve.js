// approve.js
// Route to handle client approval of posts.

import express from 'express';

const router = express.Router();

// Route to approve a post
router.get('/', (req, res) => {
  const postId = req.query.postId;

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required.' });
  }

  res.json({ message: `Client approval page for Post ID ${postId}.` });
});

export default router; // Ensure the router is exported as default