const express = require('express');
const router = express.Router();
const multer = require('multer');
const cors = require('cors');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const postController = require('../controllers/postController'); // Certifique-se de que esse caminho está correto

// Debug: Log available controller methods
console.log('Post Controller Methods:', Object.keys(postController));

// Debug: Log middleware functions
console.log('Auth Middleware:', { requireAuth: !!requireAuth, requireRole: !!requireRole });

// Configure multer with debug
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    console.log('Creating file:', `${uniqueSuffix}-${file.originalname}`);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Debug CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

console.log('CORS Options:', corsOptions);

// Enhanced error handler with debug
const handleUploadError = (err, req, res, next) => {
  console.error('Upload Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
  }
  next(err);
};

// Check if all necessary functions are defined in the controller
if (!postController.uploadPost) {
  console.error('Error: uploadPost function is not defined in the postController.');
}
if (!postController.approveByTeam) {
  console.error('Error: approveByTeam function is not defined in the postController.');
}
if (!postController.approveByClient) {
  console.error('Error: approveByClient function is not defined in the postController.');
}
if (!postController.publishPost) {
  console.error('Error: publishPost function is not defined in the postController.');
}

// Protected routes with CORS
router.options('/upload', cors(corsOptions));
router.post('/upload', 
  cors(corsOptions),
  requireAuth, 
  upload.single('file'),
  handleUploadError,
  postController.uploadPost || ((req, res) => res.status(500).json({ error: 'uploadPost function not implemented' }))
);

router.post('/approve/team/:id',
  cors(corsOptions),
  requireAuth,
  requireRole('team'),
  postController.approveByTeam || ((req, res) => res.status(500).json({ error: 'approveByTeam function not implemented' }))
);

router.post('/approve/client/:id',
  cors(corsOptions),
  requireAuth,
  requireRole('client'),
  postController.approveByClient || ((req, res) => res.status(500).json({ error: 'approveByClient function not implemented' }))
);

router.post('/publish/:id',
  cors(corsOptions),
  requireAuth,
  requireRole('admin'),
  postController.publishPost || ((req, res) => res.status(500).json({ error: 'publishPost function not implemented' }))
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Post route error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});


module.exports = router;