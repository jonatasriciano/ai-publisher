// /Users/jonatas/Documents/Projects/ai-publisher/backend/services/llmService.js

// Import required modules
import OpenAIApi from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI API instance
const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Google Generative AI instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define a function to generate a prompt using GPT Vision
async function generatePromptFromGpt(prompt, tokens, imageBase64) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-vision",
            messages: [
                {
                    role: "system",
                    content: "You are an AI trained to analyze images and provide detailed descriptions, captions, and relevant tags. Provide responses in JSON format."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
                    ]
                }
            ],
            max_tokens: tokens,
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const message = completion.choices?.[0]?.message;
        if (!message) {
            throw new Error("OpenAI API returned an empty or invalid response: " + JSON.stringify(completion));
        }

        const parsedContent = JSON.parse(message.content);
        return {
            message: parsedContent,
            tokensUsed: completion.usage?.total_tokens || 0,
            apiStatus: completion.status,
        };
    } catch (error) {
        console.error("OpenAI API error:", error.response?.status, error.response?.data || error);
        throw error;
    }
}

// Define a function to generate a prompt using Gemini
async function generatePromptFromGemini(prompt, imageBase64, tokens) {

    try {
        let fullPrompt = `${prompt}\nImage: data:image/jpeg;base64,${imageBase64}`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig: { maxOutputTokens: tokens } });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const retText = response.text();
        const totalTokensUsed = response.usageMetadata.totalTokenCount ?? null;

        const ret = {
            message: retText,
            tokensUsed: totalTokensUsed,
            apiStatus: 200
        };

        return ret;
    } catch (error) {
        if (error.response) {
            console.error("GoogleGenerativeAI API error:", error.response.status, error.response.data);
        } else {
            console.error("GoogleGenerativeAI API connection error:", error);
        }
        throw error;
    }
}

// Define a function to generate captions and tags
async function generateCaptionAndTags(promptData, tokens, provider = "gemini") {
    try {
        const prompt = `Analyze this image and generate a caption and hashtags with the following criteria:
        
        Content Description: ${promptData.description}
        Tone: ${promptData.tone}
        Target Audience: ${promptData.audience}
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

        // Format tags as hashtags if they aren't already
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

// Export the functions for use in other parts of the project
export { generatePromptFromGpt, generatePromptFromGemini, generateCaptionAndTags };