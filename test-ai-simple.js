// Simple AI test without rate limiting
require('dotenv').config();
const AIService = require('./services/aiService');

async function testAI() {
  try {
    console.log('🧪 Testing AI Service (No Rate Limiting)...\n');
    
    // Test 1: Simple text explanation
    console.log('📝 Test 1: Text Explanation');
    const explanation = await AIService.explainText(
      'The party of the first part agrees to indemnify the party of the second part',
      'This is from a legal contract',
      'Contract'
    );
    console.log('✅ Explanation received:', explanation.substring(0, 100) + '...\n');
    
    // Test 2: Document analysis
    console.log('📄 Test 2: Document Analysis');
    const analysis = await AIService.analyzeDocument(
      'This agreement is between Company A and Company B. The payment terms are 30 days net. Either party may terminate with 30 days notice.',
      'Sample Contract'
    );
    console.log('✅ Analysis received:');
    console.log('- Summary:', analysis.summary.substring(0, 100) + '...');
    console.log('- Risk Level:', analysis.riskLevel);
    console.log('- Key Points:', analysis.keyPoints.length, 'points\n');
    
    // Test 3: Chat functionality
    console.log('💬 Test 3: Chat with Document');
    const chatResponse = await AIService.chatWithDocument(
      'This is a rental agreement for an apartment in Mumbai. Rent is Rs. 25,000 per month.',
      'What is the monthly rent?',
      []
    );
    console.log('✅ Chat response received:', chatResponse.substring(0, 100) + '...\n');
    
    console.log('🎉 All AI tests passed! Rate limiting has been successfully removed.');
    
  } catch (error) {
    console.error('❌ AI Test Failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if GEMINI_API_KEY is set in your .env file');
    console.error('2. Verify your API key is valid at https://ai.google.dev');
    console.error('3. Ensure you have quota available in your Google AI account');
    console.error('4. Check your internet connection');
  }
}

testAI();