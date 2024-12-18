// llmController.js
// Handles generation of captions and tags using LLMs (Google Gemini or OpenAI GPT).

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAIApi from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize OpenAI API
const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });

async function generatePromptFromGemini(prompt, tokens) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: { maxOutputTokens: tokens }
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generatePromptFromGpt(prompt, tokens) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: prompt }],
    max_tokens: tokens,
    temperature: 0.7
  });
  return completion.choices[0].message.content;
}

// Named export for generating captions and tags
export async function generateCaptionAndTags(filePath, modelType = 'gemini') {
  const prompt = `Generate caption and tags for the file: ${filePath}.`;

  if (modelType === 'gemini') {
    return await generatePromptFromGemini(prompt, 200);
  } else if (modelType === 'gpt') {
    return await generatePromptFromGpt(prompt, 200);
  } else {
    throw new Error('Invalid model type. Use "gemini" or "gpt".');
  }
}