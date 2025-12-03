// Test Qwen API functionality
import { realQwenService } from './src/components/services/llavaApi.js';

async function testQwenAPI() {
  console.log('🔍 Testing Qwen API Status...\n');

  try {
    // Test 1: Check API Status
    console.log('1️⃣ Testing API Connection...');
    const status = await realQwenService.checkAPIStatus();
    console.log('API Status:', status);

    if (status.status !== 'active') {
      console.log('❌ API is not active. Details:', status.message);
      return;
    }

    console.log('✅ API connection successful!\n');

    // Test 2: Test with a simple image (if available)
    console.log('2️⃣ Testing image analysis capability...');

    // Create a simple test image (1x1 pixel base64)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    const testPrompt = 'Describe what you see in this image.';

    console.log('Sending test analysis request...');
    const result = await realQwenService.analyzeImage(testImageBase64, testPrompt);

    console.log('✅ Analysis completed!');
    console.log('Result preview:', result.substring(0, 200) + '...');

    console.log('\n🎉 Qwen API is working correctly!');

  } catch (error) {
    console.error('❌ Qwen API Test Failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testQwenAPI();
