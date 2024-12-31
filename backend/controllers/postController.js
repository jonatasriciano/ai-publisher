// /Users/jonatas/Documents/Projects/ai-publisher/backend/controllers/postController.js
const llmService = require('../services/llmService'); // Import the LLM service
const path = require('path'); // For handling file paths
const fs = require('fs'); // For reading files

/**
 * Handles the post upload process.
 * Validates the user, processes the uploaded file, and generates captions and tags using LLMs.
 * 
 * @param {Object} req - The request object containing user data, file, and other details.
 * @param {Object} res - The response object to send back data to the client.
 */
exports.uploadPost = async (req, res) => {
  try {
    const { platform } = req.body;

    // Check if user is approved
    if (!req.user || !req.user.approved) {
      return res.status(403).json({ error: 'User not approved to upload' });
    }

    const filePath = req.file ? req.file.path : null;
    if (!filePath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert the uploaded image to base64
    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

    // Prepare the prompt data
    const promptData = {
      description: "Generate a suitable caption and tags for this image.",
      tone: "Friendly", // Example tone
      audience: "Social media users", // Example audience
      maxTags: 10,
      image: imageBase64, // Send the base64 image
    };

    // Call LLM to generate caption and tags
    const { caption, tags } = await llmService.generateCaptionAndTags(promptData, 200);

    // Generate a fake postId for the MVP
    const postId = Date.now().toString();

    // Return the generated data
    return res.json({
      message: 'Upload successful',
      postId,
      platform,
      filePath,
      caption,
      tags,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Handles team approval for a post.
 * Simulates approval for MVP purposes.
 * 
 * @param {Object} req - The request object containing the postId.
 * @param {Object} res - The response object to send back data to the client.
 */
exports.approveByTeam = async (req, res) => {
  try {
    const { postId } = req.body;

    // Simulate team approval (replace with DB logic in production)
    return res.json({ message: `Post ${postId} approved by team` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Handles client approval for a post.
 * Simulates approval for MVP purposes.
 * 
 * @param {Object} req - The request object containing the postId.
 * @param {Object} res - The response object to send back data to the client.
 */
exports.approveByClient = async (req, res) => {
  try {
    const { postId } = req.body;

    // Simulate client approval (replace with DB logic in production)
    return res.json({ message: `Post ${postId} approved by client` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Publishes the post to the specified platform.
 * Simulates publishing for MVP purposes.
 * 
 * @param {Object} req - The request object containing the postId and platform.
 * @param {Object} res - The response object to send back data to the client.
 */
exports.publishPost = async (req, res) => {
  try {
    const { postId, platform } = req.body;

    // Simulate publishing (replace with platform API logic in production)
    return res.json({ message: `Post ${postId} published to ${platform}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};