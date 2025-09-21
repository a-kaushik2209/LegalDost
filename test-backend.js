// Quick test script to verify backend is working
const axios = require('axios');

const BACKEND_URL = 'https://web-production-f3015.up.railway.app';

async function testBackend() {
  try {
    console.log('Testing backend at:', BACKEND_URL);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test API info endpoint
    const apiResponse = await axios.get(`${BACKEND_URL}/api`);
    console.log('✅ API info:', apiResponse.data);
    
    console.log('\n🎉 Backend is working correctly!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testBackend();