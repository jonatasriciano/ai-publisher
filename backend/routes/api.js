const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload'); // Express middleware for file uploads
const path = require('path');
const { requireAuth } = require('../middleware/authMiddleware'); // Middleware for authentication
const postController = require('../controllers/postController');

// Debugging log for API routes initialization
console.log('[API] Initializing routes...');

// Middleware for handling file uploads
const handleFileUpload = async (req, res, next) => {
  try {
    // Check if a file was uploaded
    if (!req.files || !req.files.file) {
      console.error('[Upload] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    console.log('[Upload] File received:', file.name);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error('[Upload] Invalid file type:', file.mimetype);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Generate a unique filename to prevent collisions
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
    const uploadPath = path.join(__dirname, '../uploads', uniqueFilename);

    // Move file to the upload directory
    await file.mv(uploadPath);
    console.log('[Upload] File successfully saved to:', uploadPath);

    // Attach file information to the request for further processing
    req.uploadedFile = {
      filename: uniqueFilename,
      path: uploadPath,
      mimetype: file.mimetype,
    };

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error('[Upload] Error:', error.message);
    res.status(500).json({ error: 'File upload failed' });
  }
};

// Route for user authentication
router.use('/auth', require('../routes/authRoutes'));

// Route for file upload
router.post(
  '/posts/upload',
  requireAuth, // Ensure the user is authenticated
  handleFileUpload, // Handle the file upload
  postController.uploadPost // Process the uploaded file
);

// Route to fetch posts
router.get('/posts', requireAuth, postController.getPosts);

module.exports = router;