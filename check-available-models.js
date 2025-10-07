// Check available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
  try {
    console.log('🔍 Checking available Gemini models...\n');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      console.error('Please check your .env file');
      return;
    }
    
    console.log('✅ API Key found, checking models...\n');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list available models
    try {
      const models = await genAI.listModels();
      console.log('📋 Available models:');
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } catch (listError) {
      console.log('⚠️  Could not list models, trying common model names...\n');
      
      // Try common model names
      const commonModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-pro-vision',
        'text-bison-001',
        'chat-bison-001'
      ];
      
      for (const modelName of commonModels) {
        try {
          console.log(`🧪 Testing model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Hello');
          const response = await result.response;
          console.log(`✅ ${modelName} - WORKS!`);
          console.log(`   Response: ${response.text().substring(0, 50)}...\n`);
          break; // Stop at first working model
        } catch (modelError) {
          console.log(`❌ ${modelName} - Not available`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking models:', error.message);
    
    if (error.status === 401) {
      console.error('\n🔧 API Key Issue:');
      console.error('1. Your API key might be invalid');
      console.error('2. Go to https://ai.google.dev to get a new key');
      console.error('3. Make sure the key is properly set in your .env file');
    } else if (error.status === 403) {
      console.error('\n🔧 Permission Issue:');
      console.error('1. Your API key might not have access to Gemini models');
      console.error('2. Check your Google Cloud project settings');
      console.error('3. Ensure Gemini API is enabled');
    }
  }
}

checkModels();