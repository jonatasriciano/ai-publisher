// /Users/jonatas/Documents/Projects/ai-publisher/backend/controllers/postController.js
const llmService = require('../services/llmService');
const path = require('path');
const fs = require('fs');

exports.uploadPost = async (req, res) => {
  try {
    const { platform } = req.body;

    // Check if user is approved
    if (!req.user.approved) {
      return res.status(403).json({ error: 'User not approved to upload' });
    }

    const filePath = req.file ? req.file.path : null;
    if (!filePath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Call LLM to generate caption and tags
    const { caption, tags } = await llmService.generateCaptionAndTags(filePath);

    // For MVP, just return data. In real scenario, store in DB with status = "PENDING_TEAM_APPROVAL".
    // Let's generate a fake postId:
    const postId = Date.now().toString();

    // Return the data
    return res.json({
      message: 'Upload successful',
      postId,
      platform,
      filePath,
      caption,
      tags
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.approveByTeam = async (req, res) => {
  try {
    const { postId } = req.body;
    // For MVP, we won't query a real DB. We'll just simulate.
    // In reality, you'd fetch the post, update status to "TEAM_APPROVED".

    return res.json({ message: `Post ${postId} approved by team` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.approveByClient = async (req, res) => {
  try {
    const { postId } = req.body;
    // Similarly, we'd update post status to "CLIENT_APPROVED".

    return res.json({ message: `Post ${postId} approved by client` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.publishPost = async (req, res) => {
  try {
    const { postId, platform } = req.body;
    // Here you'd do the actual publish to LinkedIn or Instagram using their APIs.
    return res.json({ message: `Post ${postId} published to ${platform}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};