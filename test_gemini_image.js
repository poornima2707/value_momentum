import { analyzeImageWithGemini } from './src/components/services/geminiApi.js';
import fs from 'fs';
import path from 'path';

async function testGeminiImageAnalysis() {
  console.log('🔍 Testing Gemini Image Analysis...');

  try {
    // Use one of the available image files
    const imagePath = '0001 - Copy.JPEG';

    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image file not found: ${imagePath}`);
      return;
    }

    console.log(`📸 Testing with image: ${imagePath}`);

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const imageFile = new File([imageBuffer], path.basename(imagePath), {
      type: 'image/jpeg'
    });

    console.log('🖼️  Analyzing image with Gemini...');

    // Test image analysis
    const result = await analyzeImageWithGemini(imageFile, 'This is a test for insurance damage assessment');

    if (result.success) {
      console.log('✅ Image analysis successful!');
      console.log('📊 Analysis Results:');
      console.log(`   - Damage Type: ${result.data.damageType}`);
      console.log(`   - Severity Level: ${result.data.severityLevel}`);
      console.log(`   - Affected Areas: ${result.data.affectedAreas}`);
      console.log(`   - Repair Requirements: ${result.data.repairRequirements}`);
      console.log(`   - Potential Causes: ${result.data.potentialCauses}`);
      console.log(`   - Safety Concerns: ${result.data.safetyConcerns}`);
      console.log(`   - Recommended Actions: ${result.data.immediateActions}`);
      console.log('\n📝 Full Report Preview:');
      console.log(result.data.fullReport.substring(0, 200) + '...');
    } else {
      console.error('❌ Image analysis failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error during image analysis test:', error.message);
  }
}

// Run the test
testGeminiImageAnalysis();
