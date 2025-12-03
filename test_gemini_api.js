// Test Gemini API functionality
import { generateChatResponse } from './src/components/services/geminiApi.js';

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Status...\n');

  try {
    // Test 1: Simple chat response
    console.log('1️⃣ Testing Gemini chat response...');

    const testMessage = 'Hello, can you help me with insurance claims?';
    const context = {};

    console.log('Sending test message:', testMessage);
    const result = await generateChatResponse(testMessage, context);

    console.log('✅ Gemini API Response received!');
    console.log('Response preview:', result.substring(0, 200) + '...');

    console.log('\n🎉 Gemini API is working correctly!');

  } catch (error) {
    console.error('❌ Gemini API Test Failed:', error.message);
    console.error('Full error:', error);

    // Check if it's a model issue
    if (error.message.includes('model')) {
      console.log('\n💡 Possible issue: Model name might be incorrect.');
      console.log('Current model:', 'google/gemini-2.0-flash-exp:free');
      console.log('Try checking available models on OpenRouter or use a different model name.');
    }
  }
}

// Run the test
testGeminiAPI();
