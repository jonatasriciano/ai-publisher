// Required dependencies
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
require('dotenv').config();

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
    console.error("OpenAI API error:", error.message);
    throw error;
  }
}

/**
 * Generates a response using Google Gemini AI model.
 *
 * @param {string} prompt - The user prompt to send to Gemini.
 * @param {string} image - The image input for Gemini.
 * @param {number} [maxTokens=150] - Maximum number of tokens for the response.
 * @returns {Object} The generated message and token usage (estimated).
 */
async function generatePromptFromGemini(prompt, image, maxTokens = 150) {
  try {
    console.log("Sending to Gemini API:", { prompt, image, maxTokens });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([prompt, image]);

    console.log("Gemini API response:", result);

    // Check if the response is valid before accessing it
    if (!result || !result.response || !result.response.text) {
      throw new Error("Invalid response from Gemini API: Response or text is missing.");
    }

    let message;
    try {
      // Extract JSON from markdown code block, if any
        const text = await result.response.text();
        const jsonString = text.replace(/```json\n|```/g, '');

         message = JSON.parse(jsonString);


    } catch (e) {
      const text = await result.response.text();
      message = text
      console.warn("Response from Gemini is not a valid JSON", e);
    }

    const tokensUsed = result?.response?.usageMetadata?.totalTokens;

    return {
      message: message,
      tokensUsed: tokensUsed || maxTokens, // fallback to maxTokens if token data is missing
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    // You might want to throw a more specific error here if needed
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Generates social media captions and hashtags using the specified AI provider.
 *
 * @param {Object} promptData - The prompt data containing platform, audience, tone, etc.
 * @param {string} [provider="openai"] - The AI provider to use ('openai' or 'gemini').
 * @returns {Object} The generated caption, hashtags, description, and token usage.
 */
async function generateCaptionAndTags(file, body, provider = "gemini") {
  try {
    let { platform, caption, tone, targetAudience, maximumTags } = body;
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
          Generate a social media caption and relevant hashtags for this image.
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

    let result;

    if (provider === "openai") {
      const systemPrompt = `You are a social media expert`;
      result = await generatePromptFromGpt(prompt, geminiImage, systemPrompt);
    } else if (provider === "gemini") {
      result = await generatePromptFromGemini(prompt, geminiImage);
    } else {
      throw new Error("Invalid provider specified. Use 'openai' or 'gemini'.");
    }

    const { message } = result;


      let formattedTags = "";
      let description = "";
      caption = "No caption generated";


   if (typeof message === 'object' && message !== null) {
         if (message.caption) {
             caption = message.caption;
         }

         if(message.description) {
           description = message.description
         }

          if (message.tags) {
              if (Array.isArray(message.tags)) {
                  formattedTags = message.tags
                      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
                      .join(" ");
              } else if (typeof message.tags === "string") {
                formattedTags = message.tags.startsWith("#")
                      ? message.tags
                      : `#${message.tags}`;
            }
        }
     } else if (typeof message === 'string') {
        // Try to extract caption, tags, and description using regex
        const captionMatch = message.match(/caption:\s*(.+?)(?=\s*(?:tags:|description:|$))/i);
        const tagsMatch = message.match(/tags:\s*(.+?)(?=\s*(?:description:|$))/i);
        const descriptionMatch = message.match(/description:\s*(.+)$/i);


          if (captionMatch && captionMatch[1]) {
              caption = captionMatch[1].trim();
           }


            if (descriptionMatch && descriptionMatch[1]) {
                description = descriptionMatch[1].trim();
             }


        if (tagsMatch && tagsMatch[1]) {
             formattedTags = tagsMatch[1].trim().split(',').map(tag => (tag.startsWith("#") ? tag : `#${tag}`)).join(' ');
         }


        console.log("Response from Gemini as string", message)
     }



    return {
      caption: caption,
      tags: formattedTags || "No tags generated",
      description: description || "",
      tokensUsed: result.tokensUsed,
      provider,
    };
  } catch (error) {
    console.error("Error generating caption and tags:", error);
    throw new Error(`Error generating caption and tags: ${error.message}`);
  }
}

// Exporting functions and middleware
module.exports = {
  generatePromptFromGpt,
  generatePromptFromGemini,
  generateCaptionAndTags,
  aiLimiter,
};