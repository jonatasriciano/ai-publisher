const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const { requireAuth } = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueHash = crypto.createHash('sha256')
      .update(`${timestamp}-${file.originalname}-${Math.random()}`)
      .digest('hex');

    const extension = file.originalname.split('.').pop();
    const hashedFilename = `${uniqueHash}-${timestamp}.${extension}`;
    cb(null, hashedFilename);
  }
});

const upload = multer({ storage });

// Authentication routes
router.use('/auth', authRoutes);

// Post routes
router.post('/posts/upload', requireAuth, upload.single('file'), postController.uploadPost);
router.get('/posts', requireAuth, postController.getPosts);
router.get('/posts/:postId', requireAuth, postController.getPostById);
router.get('/approval/:postId', requireAuth, postController.getPostById);
router.get('/edit/:postId', requireAuth, postController.getPostById);
router.put('/posts/:postId', requireAuth, postController.updatePost);
router.post('/posts/:postId/approve', requireAuth, postController.approvePost);
router.delete('/posts/:postId', requireAuth, postController.deletePost);

// AI-Powered Auto Commenting
router.get('/posts/auto-comment', requireAuth, postController.autoCommentOnFeed);

// Default fallback for unmatched routes
router.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

module.exports = router;