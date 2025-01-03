const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');

// Configure API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

async function generatePromptFromGpt(prompt, maxTokens = 150, image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", url: image }
          ],
        },
      ],
      max_tokens: maxTokens
    });

    return {
      message: JSON.parse(response.choices[0].message.content),
      tokensUsed: response.usage.total_tokens
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

async function generatePromptFromGemini(prompt, image, maxTokens = 150) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    
    return {
      message: JSON.parse(response.text()),
      tokensUsed: maxTokens // Gemini doesn't provide token count
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

async function generateCaptionAndTags(promptData, provider = "openai") {
  try {
    const tokens = promptData.maxTokens || 150;
    const prompt = `Generate a social media caption and relevant hashtags for this image.
      Platform: ${promptData.platform}
      Target Audience: ${promptData.audience}
      Tone: ${promptData.tone}
      Maximum Tags: ${promptData.maxTags}

      Provide your response in JSON format with the following structure:
      {
          "caption": "Your generated caption here",
          "tags": ["tag1", "tag2", "tag3"],
          "description": "Detailed description of the image"
      }`;

    let result;

    if (provider === "openai") {
      result = await generatePromptFromGpt(prompt, tokens, promptData.image);
    } else if (provider === "gemini") {
      result = await generatePromptFromGemini(prompt, promptData.image, tokens);
    } else {
      throw new Error("Invalid provider specified. Use 'openai' or 'gemini'.");
    }

    const { message } = result;

    const formattedTags = Array.isArray(message.tags)
      ? message.tags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")
      : message.tags;

    return {
      caption: message.caption || "No caption generated",
      tags: formattedTags || "No tags generated",
      description: message.description || "",
      tokensUsed: result.tokensUsed,
      provider,
    };
  } catch (error) {
    console.error("Error generating caption and tags:", error);
    throw error;
  }
}

module.exports = { 
  generatePromptFromGpt, 
  generatePromptFromGemini, 
  generateCaptionAndTags,
  aiLimiter 
};