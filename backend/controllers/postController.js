const llmService = require('../services/llmService');
const path = require('path');
const fs = require('fs');
const Post = require('../models/postModel');

exports.uploadPost = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.user || !req.user.approved) {
      return res.status(403).json({ error: 'User not approved to upload' });
    }

    const { platform } = req.body;
    const validPlatforms = ['LinkedIn', 'Twitter', 'Facebook'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    
    const stats = fs.statSync(filePath);
    if (stats.size > 5 * 1024 * 1024) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'File too large' });
    }

    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

    const promptData = {
      platform,
      description: "Generate a suitable caption and tags for this image.",
      tone: "Professional",
      audience: platform === 'LinkedIn' ? 'Business professionals' : 'Social media users',
      maxTags: platform === 'Twitter' ? 5 : 10,
      image: imageBase64,
    };

    const { caption, tags, description } = await llmService.generateCaptionAndTags(promptData);

    const post = await Post.create({
      userId: req.user._id,
      platform,
      filePath: req.file.filename,
      caption,
      tags: tags.split(' '),
      aiGenerated: {
        caption: true,
        tags: true,
        provider: 'openai'
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        platform,
        caption,
        tags: post.tags,
        status: post.status
      }
    });

  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};