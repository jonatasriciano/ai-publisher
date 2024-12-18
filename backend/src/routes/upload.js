// upload.js
// Route to handle file uploads and call LLMs for generating captions and tags.

import express from 'express';
import multer from 'multer';
import path from 'path';
import { generateCaptionAndTags } from '../controllers/llmController.js'; // Named import

const router = express.Router();

// Setup file storage using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'src/public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// POST /upload
router.post('/', upload.single('media'), async (req, res) => {
  const platform = req.body.platform || "unknown";
  const filePath = `/uploads/${req.file.filename}`;

  try {
    // Generate caption and tags using Gemini or GPT
    const { caption, tags } = await generateCaptionAndTags(filePath, "gemini");

    res.json({
      message: 'File uploaded and processed successfully.',
      filePath,
      platform,
      caption,
      tags
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process file upload.',
      details: error.message
    });
  }
});

export default router;