// review.js
// Route to handle internal review of posts.

import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'This is the review route.' });
});

export default router; // Ensure default export