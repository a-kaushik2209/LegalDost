// Test Gemini API connection and authentication
require('dotenv').config();

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET ✅' : 'NOT SET ❌');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('\n❌ GEMINI_API_KEY is not set!');
    console.error('Please add GEMINI_API_KEY to your .env file');
    console.error('Get your API key from: https://ai.google.dev');
    return;
  }
  
  // Show partial API key for verification
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('- API Key format:', `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Test direct API call
  console.log('\n🌐 Testing direct API call...');
  
  try {
    const fetch = require('node-fetch');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log('Making request to:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Connection successful!');
      console.log('📋 Available models:');
      
      if (data.models && data.models.length > 0) {
        data.models.forEach((model, index) => {
          console.log(`${index + 1}. ${model.name}`);
        });
        
        // Try to use the first available model
        const firstModel = data.models[0];
        console.log(`\n🧪 Testing with model: ${firstModel.name}`);
        
        // Update aiService.js with working model
        console.log(`\n💡 Update your aiService.js to use: "${firstModel.name}"`);
        
      } else {
        console.log('⚠️  No models found in response');
      }
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Response:', data);
      
      if (response.status === 401) {
        console.error('\n🔧 Fix: Your API key is invalid');
        console.error('1. Go to https://ai.google.dev');
        console.error('2. Generate a new API key');
        console.error('3. Update your .env file');
      } else if (response.status === 403) {
        console.error('\n🔧 Fix: API access denied');
        console.error('1. Check if Gemini API is enabled in your Google Cloud project');
        console.error('2. Verify billing is set up (if required)');
      }
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('\n🔧 Possible fixes:');
    console.error('1. Check your internet connection');
    console.error('2. Verify the API key is correct');
    console.error('3. Try again in a few minutes');
  }
}

// Install node-fetch if not available
try {
  require('node-fetch');
  testGeminiAPI();
} catch (error) {
  console.log('📦 Installing node-fetch...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install node-fetch@2', { stdio: 'inherit' });
    console.log('✅ node-fetch installed, running test...\n');
    testGeminiAPI();
  } catch (installError) {
    console.error('❌ Failed to install node-fetch');
    console.error('Please run: npm install node-fetch@2');
  }
}