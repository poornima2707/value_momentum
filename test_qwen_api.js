// Test Qwen API connection
import { generateChatResponse } from './src/components/services/qwenApi.js';

async function testQwenAPI() {
  try {
    console.log('Testing Qwen API...');

    const testMessage = "Hello, can you confirm you are working?";
    const response = await generateChatResponse(testMessage);

    console.log('✅ Qwen API Test Successful!');
    console.log('Response:', response);

    return true;
  } catch (error) {
    console.error('❌ Qwen API Test Failed:', error.message);
    console.log('\n🔧 To fix this:');
    console.log('1. Get a Qwen API key from: https://dashscope.aliyuncs.com/');
    console.log('2. Add to your .env file: VITE_QWEN_API_KEY=your_actual_api_key_here');
    console.log('3. Restart your development server');

    return false;
  }
}

// Run the test
testQwenAPI();
