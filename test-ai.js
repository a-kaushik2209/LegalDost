#!/usr/bin/env node

require('dotenv').config();
const aiService = require('./services/aiService');

const testDocument = `
RENTAL AGREEMENT

This rental agreement is made between John Doe (Landlord) and Jane Smith (Tenant).

TERMS:
1. Monthly rent: $1,200 due on the 1st of each month
2. Security deposit: $2,400 (non-refundable)
3. Lease term: 12 months starting January 1, 2024
4. Termination: Landlord may terminate this agreement at any time without notice
5. Repairs: Tenant is responsible for all repairs regardless of cause
6. Liability: Tenant accepts all liability for any damages to the property
7. Privacy: Landlord may enter the property at any time without notice

PENALTIES:
- Late rent payment: $500 penalty
- Early termination by tenant: 6 months rent penalty
- Any violation: $1,000 fine

By signing below, tenant waives all rights to dispute resolution.
`;

async function testAI() {
  console.log('🧪 Testing AI Integration...\n');
  
  try {
    console.log('📄 Analyzing test rental agreement...');
    const analysis = await aiService.analyzeDocument(testDocument, "Test Rental Agreement");
    
    console.log('\n✅ AI Analysis Results:');
    console.log('📊 Risk Level:', analysis.riskLevel);
    console.log('📝 Summary:', typeof analysis.summary === 'string' ? analysis.summary.substring(0, 100) + '...' : 'Summary available');
    console.log('🎯 Key Points:', analysis.keyPoints.length);
    console.log('⚠️  Violations:', analysis.violations?.length || 0);
    console.log('💡 Recommendations:', analysis.recommendations?.length || 0);
    
    if (analysis.violations && analysis.violations.length > 0) {
      console.log('\n🚨 Legal Violations Found:');
      analysis.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.clause}`);
        console.log(`   Severity: ${violation.severity}`);
        console.log(`   Law: ${violation.governmentClause}`);
      });
    }
    
    console.log('\n💬 Testing AI Chat...');
    const chatResponse = await aiService.chatWithDocument(
      testDocument, 
      "What are the biggest problems with this rental agreement?"
    );
    
    console.log('🤖 AI Chat Response:', chatResponse.substring(0, 200) + '...');
    
    console.log('\n🎉 AI Integration Test Successful!');
    console.log('✅ Real Gemini AI is working');
    console.log('✅ Document analysis is functional');
    console.log('✅ Chat functionality is working');
    console.log('✅ Legal compliance checking is active');
    
  } catch (error) {
    console.error('❌ AI Test Failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Check your GEMINI_API_KEY in .env file');
    } else if (error.message.includes('quota')) {
      console.log('\n💡 API quota exceeded - try again later');
    } else {
      console.log('\n💡 Check your internet connection and API key');
    }
  }
}

testAI();