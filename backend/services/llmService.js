// Required dependencies
const { OpenAI } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require("express-rate-limit");
const fs = require("fs").promises;
require("dotenv").config();

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure rate limiting middleware
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Limit each IP to 100 requests per windowMs
});

/**
 * Generates a response using OpenAI GPT model.
 *
 * @param {string} userPrompt - The user prompt to send to GPT.
 * @param {string} imgUrl - The URL of the image related to the prompt.
 * @param {string} systemPrompt - System-level instructions for GPT.
 * @param {number} [maxTokens=300] - Maximum number of tokens for the response.
 * @param {number} [topP=0.1] - Top-p sampling parameter.
 * @returns {Object} The generated message and token usage.
 */
async function generatePromptFromGpt(userPrompt, imgUrl, systemPrompt, maxTokens = 300, topP = 0.1) {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Image URL: ${imgUrl}` },
      { role: "user", content: userPrompt },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: maxTokens,
      top_p: topP,
    });

    return {
      message: response.choices[0]?.message?.content || "No response generated",
      tokensUsed: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("[OpenAI] API error:", error.message);
    throw error;
  }
}

/**
 * Generates a response using Google Gemini AI model.
 *
 * @param {string} prompt - The user prompt to send to Gemini.
 * @param {string} image - The image input for Gemini.
 * @param {number} [maxTokens=1000] - Maximum number of tokens for the response.
 * @returns {Object} The generated message and token usage (estimated).
 */
async function generatePromptFromGemini(prompt, image, maxTokens = 1000) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      maxTokens: maxTokens,
    });
    const result = await model.generateContent([prompt, image]);

    if (!result || !result.response || !result.response.text) {
      throw new Error("Invalid response from Gemini API: Response or text is missing.");
    }

    let message;
    try {
      const text = await result.response.text();
      const jsonString = text.replace(/```json\n|```/g, "");
      message = JSON.parse(jsonString);
    } catch (e) {
      const text = await result.response.text();
      message = text;
      console.warn("[Gemini] Response is not valid JSON");
    }

    const tokensUsed = result?.response?.usageMetadata?.totalTokens;

    return {
      message: message,
      tokensUsed: tokensUsed || maxTokens,
    };
  } catch (error) {
    console.error("[Gemini] API error:", error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Generates social media captions and hashtags using the specified AI provider.
 *
 * @param {Object} promptData - The prompt data containing platform, audience, tone, etc.
 * @param {string} [provider="gemini"] - The AI provider to use ('openai' or 'gemini').
 * @returns {Object} The generated caption, hashtags, description, and token usage.
 */
async function generateCaptionAndTags(file, body, provider = "gemini") {
  try {
    const { platform, guidelines, tone, targetAudience, maximumTags } = body;
    const imagePath = file.path;
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const geminiImage = {
      inlineData: {
        data: imageBase64,
        mimeType: file.mimetype,
      },
    };

    const prompt = `
      Develop a caption or long post according to the guidelines adapted for social networks and a set of hashtags relevant to the image provided. Make sure that the results meet the following parameters:
      Guidelines: ${guidelines}
      Platform: ${platform}
      Target Audience: ${targetAudience}
      Tone: ${tone}
      Maximum Tags: ${maximumTags}
    
      Provide your response in JSON format with the following structure:
      {
          "caption": "Your generated caption here",
          "tags": ["tag1", "tag2", "tag3"],
          "description": "Detailed description of the image"
      }
      `;

    let result = await generatePromptFromGemini(prompt, geminiImage);
    const message = result.message;
    let caption, tags, description;

    if (typeof message === "object") {
      caption = message.caption;
      description = message.description;
      tags = message.tags;
    }

    return {
      caption: caption || "No caption generated",
      description: description || "No description generated",
      tags: tags || [],
      tokensUsed: result.tokensUsed,
      provider,
    };
  } catch (error) {
    console.error("[AI Service] Error generating caption and tags:", error.message);
    throw new Error(`Error generating caption and tags: ${error.message}`);
  }
}

/**
 * AI-powered analysis of an image and caption to generate an engagement comment.
 *
 * @param {string} mediaUrl - The URL of the media to analyze.
 * @param {string} caption - The caption of the media.
 * @param {string} [provider="gemini"] - AI provider to use ('openai' or 'gemini').
 * @returns {string} Generated comment.
 */
async function analyzeImageAndText(mediaUrl, caption, provider = "gemini") {
  try {
    let comment;

    if (provider === "openai") {
      const response = await generatePromptFromGpt(
        `Analyze this image and generate an engaging comment based on the caption: "${caption}". The comment should be friendly and encourage engagement.`,
        mediaUrl,
        "You are an AI specialized in social media engagement."
      );
      comment = response.message;
    } else {
      const result = await generatePromptFromGemini(
        `Analyze this image and generate an engaging comment based on the caption: "${caption}". The comment should be friendly and encourage engagement.`,
        mediaUrl
      );
      comment = result.message;
    }

    return comment || "Great post!";
  } catch (error) {
    console.error("[AI Service] Error analyzing image and caption:", error.message);
    return "Great post!";
  }
}

// Exporting functions and middleware
module.exports = {
  generatePromptFromGpt,
  generatePromptFromGemini,
  generateCaptionAndTags,
  analyzeImageAndText,
  aiLimiter,
};