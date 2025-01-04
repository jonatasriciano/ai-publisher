const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const { requireAuth } = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');

// Mount auth routes
router.use('/auth', authRoutes);

// Protected post routes
router.post('/posts/upload', requireAuth, postController.uploadPost);
router.get('/posts', requireAuth, postController.getPosts);

module.exports = router;