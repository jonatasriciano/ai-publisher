const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const { requireAuth } = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    cb(null, uploadPath); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueHash = crypto
      .createHash('sha256') // Generate a SHA-256 hash
      .update(`${timestamp}-${file.originalname}-${Math.random()}`) // Use timestamp, original filename, and a random value
      .digest('hex'); // Convert to a hexadecimal string
  
    const extension = file.originalname.split('.').pop(); // Extract file extension
    const hashedFilename = `${uniqueHash}-${timestamp}.${extension}`; // Combine hash and extension
  
    cb(null, hashedFilename); // Return the generated filename
  }
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

// Upload post route
router.post(
  '/posts/upload',
  requireAuth,
  upload.single('file'),
  handleMulterErrors,
  postController.uploadPost
);

// Get all posts route
router.get('/posts', requireAuth, postController.getPosts);

// Get post by ID route
router.get('/posts/:postId', requireAuth, postController.getPostById);
router.get('/approval/:postId', requireAuth, postController.getPostById);
router.get('/edit/:postId', requireAuth, postController.getPostById);
router.put('/posts/:postId', requireAuth, postController.updatePost);
router.post('/posts/:postId/approve', requireAuth, postController.approvePost);
router.delete('/posts/:postId', requireAuth, postController.deletePost);


// Default fallback for unmatched routes
router.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

module.exports = router;