// /Users/jonatas/Documents/Projects/ai-publisher/backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/authMiddleware');
const { 
  uploadPost, 
  approveByTeam, 
  approveByClient,
  publishPost
} = require('../controllers/postController');

// Configure multer to store files in "uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Protected route for uploading
router.post('/upload', requireAuth, upload.single('file'), uploadPost);

// Protected routes for approvals
router.post('/approve/team', requireAuth, approveByTeam);
router.post('/approve/client', requireAuth, approveByClient);

// Protected route for publishing
router.post('/publish', requireAuth, publishPost);

module.exports = router;