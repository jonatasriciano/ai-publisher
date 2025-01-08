const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const { requireAuth } = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    console.log('[Multer] Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    console.log('[Multer] Generated filename:', `${uniqueSuffix}-${file.originalname}`);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Create multer upload instance
const upload = multer({ storage });

// Middleware for handling multer errors
const handleMulterErrors = (error, req, res, next) => {
  if (error) {
    console.error('[MulterError]', error.message);
    return res.status(400).json({ error: error.message });
  }
  next();
};

// Mount authentication routes
router.use('/auth', authRoutes);

// Protected upload route with multer and LLM integration
router.post(
  '/posts/upload',
  (req, res, next) => {
    console.log('[API] Upload route hit');
    next();
  },
  requireAuth,
  upload.single('file'),
  handleMulterErrors,
  postController.uploadPost
);

// Protected route to get posts
router.get('/posts', requireAuth, postController.getPosts);

module.exports = router;