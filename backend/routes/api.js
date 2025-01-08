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
    cb(null, uploadPath); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Generate a unique filename
  },
});

// Create multer upload instance
const upload = multer({ storage });

// Middleware for handling multer errors
const handleMulterErrors = (error, req, res, next) => {
  if (error) {
    return res.status(400).json({ error: error.message }); // Handle multer-related errors
  }
  next();
};

// Mount authentication routes
router.use('/auth', authRoutes);

// Protected upload route with multer and LLM integration
router.post(
  '/posts/upload',
  requireAuth,
  upload.single('file'),
  handleMulterErrors,
  postController.uploadPost
);

// Protected route to get posts
router.get('/posts', requireAuth, postController.getPosts);

module.exports = router;