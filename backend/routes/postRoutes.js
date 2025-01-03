const express = require('express');
const router = express.Router();
const multer = require('multer');
const cors = require('cors');
const { requireAuth } = require('../middleware/authMiddleware');
const { 
  uploadPost, 
  approveByTeam, 
  approveByClient, 
  publishPost 
} = require('../controllers/postController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
  }
  next(err);
};

// Protected route for uploading with CORS
router.options('/upload', cors(corsOptions));
router.post('/upload', 
  cors(corsOptions),
  requireAuth, 
  upload.single('file'),
  handleUploadError,
  uploadPost
);

// Protected routes for approvals with CORS
router.options('/approve/team', cors(corsOptions));
router.post('/approve/team', cors(corsOptions), requireAuth, approveByTeam);

router.options('/approve/client', cors(corsOptions));
router.post('/approve/client', cors(corsOptions), requireAuth, approveByClient);

// Protected route for publishing with CORS
router.options('/publish', cors(corsOptions));
router.post('/publish', cors(corsOptions), requireAuth, publishPost);

module.exports = router;