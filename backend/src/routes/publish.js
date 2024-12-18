// publish.js
// Route to handle publishing posts.

import express from 'express';
import { publishPost } from '../controllers/publishController.js'; // Named import

const router = express.Router();

router.get('/', async (req, res) => {
  const postId = req.query.postId;

  try {
    const result = await publishPost(postId);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ message: 'Post published successfully.', post: result.post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish post.' });
  }
});

export default router;