import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyDorcQzUBN7QBI1PS2hyiU2GqbhwT2TY58'; // Google Gemini API Key
const OPENAI_API_KEY = undefined; // Not using OpenAI for now

// Use OpenAI as primary, Gemini as fallback
const USE_OPENAI = OPENAI_API_KEY && OPENAI_API_KEY.length > 10;

// Updated Gemini API URLs to match the new SDK format - using available models
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_CHAT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

console.log('API Configuration:', {
  geminiKey: GEMINI_API_KEY ? 'Yes' : 'No',
  openaiKey: OPENAI_API_KEY ? 'Yes' : 'No',
  usingOpenAI: USE_OPENAI
});

class GeminiApiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.chatHistory = [];
    this.reportContext = null;
  }

  // Image Analysis Methods
  async analyzeImageWithGemini(imageFile, prompt = '') {
    // Handle both single image and array of images
    if (Array.isArray(imageFile)) {
      return this.analyzeMultipleImagesWithGemini(imageFile, prompt);
    }

    // Single image analysis (existing logic)
    // Try OpenAI first if available
    if (USE_OPENAI) {
      try {
        console.log('Using OpenAI for image analysis...');
        return await this.analyzeImageWithOpenAI(imageFile, prompt);
      } catch (error) {
        console.warn('OpenAI failed, falling back to Gemini:', error.message);
        // Fall back to Gemini
      }
    }

    // Use Gemini as fallback
    try {
      console.log('Using Gemini for image analysis...');
      // Convert image file to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Determine mime type
      let mimeType;
      if (typeof imageFile === 'string') {
        // Node.js environment - determine from file extension
        const path = await import('path');
        const ext = path.extname(imageFile).toLowerCase();
        mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                   ext === '.png' ? 'image/png' :
                   ext === '.gif' ? 'image/gif' :
                   ext === '.webp' ? 'image/webp' : 'image/jpeg';
      } else {
        // Browser environment - use file.type
        mimeType = imageFile.type;
      }

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are an insurance claims expert. Analyze this image and provide a detailed loss description for insurance claims.

                FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

                **1. Type of Damage:** [brief description]
                **2. Severity Level:** [Low/Moderate/High/Critical]
                **3. Affected Areas:** [list of areas]
                **4. Repair Requirements:** [estimated repairs needed]
                **5. Potential Causes:** [likely causes]
                **6. Safety Concerns:** [any safety issues]
                **7. Recommended Actions:** [immediate steps to take]

                Then provide a detailed analysis section.

                ${prompt ? `Additional context: ${prompt}` : ''}`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
                }
              }
            ]
          }
        ]
      };

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = this.formatResponse(response.data);

      // Store report context for chat
      if (result.success) {
        this.reportContext = this.extractReportSummary(result.data);
        this.chatHistory = []; // Reset chat history for new report
      }

      return result;
    } catch (error) {
      console.error('Error analyzing image with Gemini:', error);

      // Provide more detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.status === 400) {
          throw new Error(`Gemini API Error (400): Bad Request. Please check your API key and request format. Details: ${error.response.data?.error?.message || 'Unknown error'}`);
        } else if (error.response.status === 403) {
          throw new Error(`Gemini API Error (403): Forbidden. Please check your API key permissions.`);
        } else if (error.response.status === 404) {
          throw new Error(`Gemini API Error (404): Model not found. The specified model may not be available. Please check your Google AI setup.`);
        } else {
          throw new Error(`Gemini API Error (${error.response.status}): ${error.response.data?.error?.message || error.message}`);
        }
      } else if (error.request) {
        throw new Error('Gemini API Error: No response received. Please check your internet connection.');
      } else {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
    }
  }

  // OpenAI Vision Analysis Method
  async analyzeImageWithOpenAI(imageFile, prompt = '') {
    try {
      // Convert image file to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Determine mime type
      let mimeType;
      if (typeof imageFile === 'string') {
        // Node.js environment - determine from file extension
        const path = await import('path');
        const ext = path.extname(imageFile).toLowerCase();
        mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                   ext === '.png' ? 'image/png' :
                   ext === '.gif' ? 'image/gif' :
                   ext === '.webp' ? 'image/webp' : 'image/jpeg';
      } else {
        // Browser environment - use file.type
        mimeType = imageFile.type;
      }

      const payload = {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an insurance claims expert. Analyze this image and provide a detailed loss description for insurance claims.
                Include:
                1. Type of damage
                2. Severity level (Low, Moderate, High, Critical)
                3. Affected areas
                4. Estimated repair requirements
                5. Potential causes
                6. Safety concerns
                7. Recommended immediate actions

                Format as a professional insurance report with clear sections.

                ${prompt ? `Additional context: ${prompt}` : ''}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image.split(',')[1]}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      };

      const response = await axios.post(
        OPENAI_API_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
        }
      );

      const result = this.formatOpenAIResponse(response.data);

      // Store report context for chat
      if (result.success) {
        this.reportContext = this.extractReportSummary(result.data);
        this.chatHistory = []; // Reset chat history for new report
      }

      return result;
    } catch (error) {
      console.error('Error analyzing image with OpenAI:', error);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.status === 401) {
          throw new Error(`OpenAI API Error (401): Invalid API key. Please check your OpenAI API key.`);
        } else if (error.response.status === 429) {
          throw new Error(`OpenAI API Error (429): Rate limit exceeded. Please try again later.`);
        } else {
          throw new Error(`OpenAI API Error (${error.response.status}): ${error.response.data?.error?.message || error.message}`);
        }
      } else if (error.request) {
        throw new Error('OpenAI API Error: No response received. Please check your internet connection.');
      } else {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
    }
  }

  // Multiple Images Analysis Method
  async analyzeMultipleImagesWithGemini(imagesArray, prompt = '') {
    try {
      console.log(`Analyzing ${imagesArray.length} images with Gemini...`);

      // Convert all images to base64
      const base64Images = await Promise.all(imagesArray.map(image => this.fileToBase64(image)));

      // Create parts array with text prompt and all images
      const parts = [
        {
          text: `You are an insurance claims expert. Analyze all these images and provide a comprehensive loss description for insurance claims.

                FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

                **1. Type of Damage:** [brief description consolidated from all images]
                **2. Severity Level:** [Low/Moderate/High/Critical - consider the most severe damage across all images]
                **3. Affected Areas:** [list of areas combined from all images]
                **4. Repair Requirements:** [estimated repairs needed - comprehensive assessment]
                **5. Potential Causes:** [likely causes analyzed from patterns across images]
                **6. Safety Concerns:** [any safety issues identified from all images]
                **7. Recommended Actions:** [immediate steps to take]

                Then provide a detailed analysis section.

                ${prompt ? `Additional context: ${prompt}` : ''}`
        }
      ];

      // Add all images to parts
      for (let index = 0; index < base64Images.length; index++) {
        const base64Image = base64Images[index];
        // Determine mime type for each image
        let mimeType;
        const imageFile = imagesArray[index];
        if (typeof imageFile === 'string') {
          // Node.js environment - determine from file extension
          const path = await import('path');
          const ext = path.extname(imageFile).toLowerCase();
          mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                     ext === '.png' ? 'image/png' :
                     ext === '.gif' ? 'image/gif' :
                     ext === '.webp' ? 'image/webp' : 'image/jpeg';
        } else {
          // Browser environment - use file.type
          mimeType = imageFile.type;
        }

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
          }
        });
      }

      const payload = {
        contents: [
          {
            parts: parts
          }
        ]
      };

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = this.formatResponse(response.data);

      // Store report context for chat
      if (result.success) {
        this.reportContext = this.extractReportSummary(result.data);
        this.chatHistory = []; // Reset chat history for new report
      }

      return result;
    } catch (error) {
      console.error('Error analyzing multiple images with Gemini:', error);

      // Provide more detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.status === 400) {
          throw new Error(`Gemini API Error (400): Bad Request. Please check your API key and request format. Details: ${error.response.data?.error?.message || 'Unknown error'}`);
        } else if (error.response.status === 403) {
          throw new Error(`Gemini API Error (403): Forbidden. Please check your API key permissions.`);
        } else if (error.response.status === 404) {
          throw new Error(`Gemini API Error (404): Model not found. The specified model may not be available. Please check your Google AI setup.`);
        } else {
          throw new Error(`Gemini API Error (${error.response.status}): ${error.response.data?.error?.message || error.message}`);
        }
      } else if (error.request) {
        throw new Error('Gemini API Error: No response received. Please check your internet connection.');
      } else {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
    }
  }

  formatOpenAIResponse(data) {
    try {
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      const text = data.choices[0].message.content;

      // Parse the response into structured sections (same as Gemini)
      const sections = {
        damageType: this.extractSection(text, ['damage type', 'type of damage'], ['severity', 'damage level']),
        severityLevel: this.extractSection(text, ['severity', 'damage level'], ['affected', 'impacted']),
        affectedAreas: this.extractSection(text, ['affected', 'impacted'], ['repair', 'fix']),
        repairRequirements: this.extractSection(text, ['repair', 'fix', 'required'], ['potential', 'cause']),
        potentialCauses: this.extractSection(text, ['potential', 'cause', 'origin'], ['safety', 'concern']),
        safetyConcerns: this.extractSection(text, ['safety', 'concern', 'risk'], ['recommendation', 'action', 'next step']),
        immediateActions: this.extractSection(text, ['recommendation', 'action', 'next step'], null),
        fullReport: text
      };

      return {
        success: true,
        data: sections,
        raw: text
      };
    } catch (error) {
      console.error('Error formatting OpenAI response:', error);
      return {
        success: false,
        error: error.message,
        raw: data
      };
    }
  }

  async fileToBase64(file) {
    // Check if we're in Node.js environment (file is a path string)
    if (typeof file === 'string') {
      // Node.js environment - read file from path
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.resolve(file);
      const buffer = fs.readFileSync(fullPath);
      return `data:image/${path.extname(file).slice(1)};base64,${buffer.toString('base64')}`;
    } else {
      // Browser environment - use FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }
  }

  formatResponse(data) {
    try {
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini');
      }

      const text = data.candidates[0].content.parts[0].text;
      
      // Parse the response into structured sections
      const sections = {
        damageType: this.extractSection(text, ['damage type', 'type of damage'], ['severity', 'damage level']),
        severityLevel: this.extractSection(text, ['severity', 'damage level'], ['affected', 'impacted']),
        affectedAreas: this.extractSection(text, ['affected', 'impacted'], ['repair', 'fix']),
        repairRequirements: this.extractSection(text, ['repair', 'fix', 'required'], ['potential', 'cause']),
        potentialCauses: this.extractSection(text, ['potential', 'cause', 'origin'], ['safety', 'concern']),
        safetyConcerns: this.extractSection(text, ['safety', 'concern', 'risk'], ['recommendation', 'action', 'next step']),
        immediateActions: this.extractSection(text, ['recommendation', 'action', 'next step'], null),
        fullReport: text
      };

      return {
        success: true,
        data: sections,
        raw: text
      };
    } catch (error) {
      console.error('Error formatting Gemini response:', error);
      return {
        success: false,
        error: error.message,
        raw: data
      };
    }
  }

  extractSection(text, startKeywords, endKeywords) {
    if (!text) return '';

    const lowerText = text.toLowerCase();
    const startPatterns = Array.isArray(startKeywords) ? startKeywords : [startKeywords];
    const endPatterns = endKeywords ? (Array.isArray(endKeywords) ? endKeywords : [endKeywords]) : null;

    // Strategy 1: Look for numbered sections (1., 2., etc.) - Most common format
    for (let i = 0; i < startPatterns.length; i++) {
      const pattern = startPatterns[i].toLowerCase();

      // Look for numbered sections like "1. Type of Damage:" or "**1. Type of Damage**"
      const numberPatterns = [
        new RegExp(`\\*\\*?\\d+\\..*?${pattern}.*?\\*\\*?:?\\s*(.*?)(?=\\*\\*?\\d+\\.|\\*\\*?[A-Z]|$)`, 'si'),
        new RegExp(`\\d+\\..*?${pattern}.*?:?\\s*(.*?)(?=\\d+\\.|$)`, 'si'),
        new RegExp(`${pattern}.*?:?\\s*(.*?)(?=${endPatterns ? endPatterns.join('|') : '$'})`, 'si'),
        new RegExp(`\\*\\*${pattern}\\*\\*.*?:?\\s*(.*?)(?=\\*\\*|$|Disclaimer|Report Prepared)`, 'si')
      ];

      for (const numPattern of numberPatterns) {
        const match = text.match(numPattern);
        if (match && match[1] && match[1].trim().length > 0) {
          let result = match[1].trim();
          // Clean up common artifacts
          result = result.replace(/^[-•*]\s*/, '').replace(/\*\*$/, '').trim();
          if (result.length > 0) {
            return result;
          }
        }
      }
    }

    // Strategy 2: Look for section headers in the text
    for (const pattern of startPatterns) {
      // Look for patterns like "**Type of Damage:**" or "Type of Damage:"
      const headerPatterns = [
        new RegExp(`\\*\\*${pattern}\\*\\*.*?:?\\s*(.*?)(?=\\*\\*|$|Disclaimer|Report Prepared)`, 'si'),
        new RegExp(`${pattern}.*?:?\\s*(.*?)(?=${endPatterns ? endPatterns.join('|') : '$'})`, 'si'),
        new RegExp(`^${pattern}.*?:?\\s*(.*?)$`, 'mi')
      ];

      for (const headerPattern of headerPatterns) {
        const match = text.match(headerPattern);
        if (match && match[1] && match[1].trim().length > 3) { // Reduced minimum length
          let result = match[1].trim();
          // Clean up common artifacts
          result = result.replace(/^[-•*]\s*/, '').replace(/\*\*$/, '').trim();
          if (result.length > 0) {
            return result;
          }
        }
      }
    }

    // Strategy 3: Fallback - extract content after keywords until next major section
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    let inSection = false;
    let sectionContent = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if this line starts our section
      if (!inSection) {
        for (const pattern of startPatterns) {
          if (lowerLine.includes(pattern)) {
            inSection = true;
            // Extract content after the keyword
            const content = line.replace(new RegExp(`.*${pattern}.*?:?`, 'i'), '').trim();
            if (content) {
              // Clean up and add content
              const cleaned = content.replace(/^[-•*]\s*/, '').replace(/\*\*$/, '').trim();
              if (cleaned) sectionContent.push(cleaned);
            }
            break;
          }
        }
      } else if (inSection) {
        // Check if we've reached the end of the section
        if (endPatterns) {
          let shouldEnd = false;
          for (const endPattern of endPatterns) {
            if (lowerLine.includes(endPattern.toLowerCase())) {
              shouldEnd = true;
              break;
            }
          }
          if (shouldEnd) break;
        }

        // Skip empty lines or section headers
        if (line.trim() && !line.match(/^\d+\./) && !line.match(/^\*.*\*$/) && !line.match(/^#/)) {
          const cleaned = line.trim().replace(/^[-•*]\s*/, '').replace(/\*\*$/, '').trim();
          if (cleaned) sectionContent.push(cleaned);
        }

        // Stop if we hit another numbered section or bold header
        if (line.match(/^\d+\./) || line.match(/^\*.*\*$/) || line.match(/^#/)) {
          break;
        }
      }
    }

    const result = sectionContent.join(' ').trim();

    // Strategy 4: If still no result, try a more aggressive approach
    if (!result) {
      // Look for any line that contains the keywords and extract everything after it
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        for (const pattern of startPatterns) {
          if (lowerLine.includes(pattern)) {
            const content = line.replace(new RegExp(`.*${pattern}.*?:?`, 'i'), '').trim();
            if (content && content.length > 2) {
              const cleaned = content.replace(/^[-•*]\s*/, '').replace(/\*\*$/, '').trim();
              if (cleaned) return cleaned;
            }
          }
        }
      }

      // Last resort: search for keywords anywhere in the text and extract surrounding content
      for (const pattern of startPatterns) {
        const index = lowerText.indexOf(pattern);
        if (index !== -1) {
          // Extract more characters around the keyword to get complete information
          const start = Math.max(0, index - 100);
          const end = Math.min(text.length, index + 200);
          const extracted = text.substring(start, end).replace(new RegExp(`.*${pattern}.*?:?`, 'i'), '').trim();
          if (extracted && extracted.length > 5) {
            const cleaned = extracted.replace(/^[-•*]\s*/, '').replace(/\*\*$/, '').trim();
            if (cleaned) return cleaned;
          }
        }
      }
    }

    return result;
  }

  extractReportSummary(analysisData) {
    const summary = {
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'Gemini Pro Vision',
        reportType: 'Insurance Loss Assessment'
      },
      summary: {
        damageType: this.extractKeyInfo(analysisData.damageType),
        severity: this.extractSeverity(analysisData.severityLevel),
        affectedAreas: this.extractList(analysisData.affectedAreas),
        estimatedCost: this.extractCost(analysisData.repairRequirements),
        safety: analysisData.safetyConcerns,
        recommendations: this.extractRecommendations(analysisData.immediateActions)
      },
      fullAnalysis: analysisData
    };

    return summary;
  }

  extractKeyInfo(text) {
    // Extract main damage type from text
    const commonDamageTypes = [
      'hail damage', 'water damage', 'fire damage', 'wind damage', 'storm damage',
      'flood damage', 'collision damage', 'vandalism', 'theft', 'earthquake',
      'structural damage', 'cosmetic damage', 'mechanical failure', 'electrical damage'
    ];

    for (const type of commonDamageTypes) {
      if (text.toLowerCase().includes(type)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }

    return text.split('.')[0] || 'Damage detected';
  }

  extractSeverity(text) {
    const severityLevels = {
      'critical': 'Critical',
      'high': 'High',
      'moderate': 'Moderate',
      'low': 'Low',
      'minor': 'Low'
    };

    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(severityLevels)) {
      if (lowerText.includes(key)) {
        return value;
      }
    }

    return 'Moderate';
  }

  extractList(text) {
    const items = text.split(/[•\-*\n]/).filter(item => item.trim().length > 0);
    return items.slice(0, 5).map(item => item.trim()); // Return top 5 items
  }

  extractCost(text) {
    const costPattern = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars|USD)/i;
    const match = text.match(costPattern);
    return match ? match[0] : 'Estimation required';
  }

  extractRecommendations(text) {
    const recommendations = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('should') || 
          line.toLowerCase().includes('advise') ||
          line.toLowerCase().includes('immediate')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations.length > 0 ? recommendations.slice(0, 3) : [
      'Document all damage with photos',
      'Contact insurance provider',
      'Secure property from further damage'
    ];
  }

  // Chat Methods
  async generateChatResponse(userMessage, context = {}) {
    try {
      // Add user message to history
      this.addToChatHistory('user', userMessage);
      
      // Prepare context for Gemini
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Combine history and current message
      const messages = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...this.chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const payload = {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await axios.post(
        `${GEMINI_CHAT_API_URL}?key=${this.apiKey}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        const assistantResponse = response.data.candidates[0].content.parts[0].text;
        
        // Add assistant response to history
        this.addToChatHistory('assistant', assistantResponse);
        
        return assistantResponse;
      } else {
        return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
      }
    } catch (error) {
      console.error('Error calling Gemini API for chat:', error);
      
      // Fallback to contextual response if API fails
      return this.getFallbackResponse(userMessage, context);
    }
  }

  buildSystemPrompt(context) {
    let prompt = `You are an expert insurance claims assistant. You help users understand their loss assessment reports, guide them through claim processes, and answer questions about damage assessment.

Your responses should be:
1. Professional yet friendly
2. Clear and concise
3. Helpful and actionable
4. Based on available data`;

    // Add report context if available
    if (this.reportContext) {
      prompt += `

Current Report Context:
- Damage Type: ${this.reportContext.summary.damageType}
- Severity: ${this.reportContext.summary.severity}
- Primary Concerns: ${this.reportContext.summary.safety?.substring(0, 100) || 'Not specified'}
- Key Recommendations: ${this.reportContext.summary.recommendations.join(', ')}
`;
    }

    // Add any additional context
    if (context.userDetails) {
      prompt += `\nUser Details: ${JSON.stringify(context.userDetails)}`;
    }

    prompt += `\n\nPlease respond to the user's questions based on this context.`;

    return prompt;
  }

  getFallbackResponse(userMessage, context) {
    const message = userMessage.toLowerCase();
    
    // Check if we have report context
    if (this.reportContext) {
      const summary = this.reportContext.summary;
      
      if (message.includes('summary') || message.includes('summarize')) {
        return `Based on your assessment report:

**Damage Type**: ${summary.damageType}
**Severity Level**: ${summary.severity}
**Key Areas Affected**: ${summary.affectedAreas.join(', ')}
**Safety Concerns**: ${summary.safety?.substring(0, 150) || 'Please review the full report for safety details'}
**Recommended Actions**: ${summary.recommendations.join('; ')}`;
      }

      if (message.includes('next step') || message.includes('what should i do')) {
        return `Here are the recommended next steps based on your ${summary.severity.toLowerCase()} severity assessment:

1. **${summary.recommendations[0] || 'Document all damage thoroughly'}**
2. **${summary.recommendations[1] || 'Contact your insurance provider'}**
3. **${summary.recommendations[2] || 'Secure the property to prevent further damage'}**

Would you like more specific guidance on any of these steps?`;
      }

      if (message.includes('claim') || message.includes('insurance')) {
        return `For your ${summary.damageType.toLowerCase()} with ${summary.severity.toLowerCase()} severity:

**Documents to prepare for claim:**
• This assessment report
• All damage photos
• Policy information
• Police/incident reports (if applicable)
• Repair estimates (if available)

**Recommended claim process:**
1. Contact your insurer within 24 hours
2. Submit this report as supporting documentation
3. Follow their specific claim procedures`;
      }
    }

    // General responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm your Loss Assessment Assistant. I can help you understand insurance claims, damage assessment, and answer questions about your report. How can I assist you today?";
    }

    if (message.includes('help') || message.includes('what can you do')) {
      return "I can help you with:\n• Understanding your damage assessment report\n• Explaining insurance claim processes\n• Providing guidance on next steps\n• Answering questions about loss types and severity\n• Offering general advice on property damage assessment\n\nWhat would you like to know?";
    }

    if (message.includes('thank')) {
      return "You're welcome! I'm here to help. If you have any more questions about your assessment or the claim process, feel free to ask.";
    }

    return "I understand you're asking about loss assessment. To give you the best advice, could you please:\n1. Upload damage images for analysis, or\n2. Ask specific questions about your existing report, or\n3. Tell me what type of damage you're dealing with?";
  }

  addToChatHistory(role, content) {
    this.chatHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 messages to manage token limit
    if (this.chatHistory.length > 10) {
      this.chatHistory = this.chatHistory.slice(-10);
    }
  }

  getChatHistory() {
    return this.chatHistory;
  }

  clearChatHistory() {
    this.chatHistory = [];
  }

  setReportContext(context) {
    this.reportContext = context;
  }

  getReportContext() {
    return this.reportContext;
  }

  // Method to combine multiple analysis results
  combineAnalysisResults(allResults) {
    if (!allResults || allResults.length === 0) {
      return null;
    }

    if (allResults.length === 1) {
      return allResults[0];
    }

    // Combine results from multiple images
    const combined = {
      damageType: this.combineDamageTypes(allResults),
      severityLevel: this.combineSeverityLevels(allResults),
      affectedAreas: this.combineAffectedAreas(allResults),
      repairRequirements: this.combineRepairRequirements(allResults),
      potentialCauses: this.combinePotentialCauses(allResults),
      safetyConcerns: this.combineSafetyConcerns(allResults),
      immediateActions: this.combineImmediateActions(allResults),
      fullReport: this.combineFullReports(allResults)
    };

    return combined;
  }

  combineDamageTypes(results) {
    const damageTypes = results.map(r => r.damageType).filter(Boolean);
    const uniqueTypes = [...new Set(damageTypes.map(type => type.toLowerCase()))];

    if (uniqueTypes.length === 1) {
      return damageTypes[0];
    }

    // If multiple types, create a comprehensive description
    return `Multiple damage types identified: ${uniqueTypes.join(', ')}`;
  }

  combineSeverityLevels(results) {
    const severities = results.map(r => r.severityLevel).filter(Boolean);
    const severityMap = { 'low': 1, 'moderate': 2, 'high': 3, 'critical': 4 };

    // Find the highest severity level
    let maxSeverity = 'low';
    let maxScore = 0;

    severities.forEach(severity => {
      const lowerSeverity = severity.toLowerCase();
      const score = severityMap[lowerSeverity] || 1;
      if (score > maxScore) {
        maxScore = score;
        maxSeverity = severity;
      }
    });

    return maxSeverity;
  }

  combineAffectedAreas(results) {
    const allAreas = results.flatMap(r => {
      if (!r.affectedAreas) return [];
      // Split by common delimiters and filter empty items
      return r.affectedAreas.split(/[•\-*\n,]/).map(area => area.trim()).filter(area => area.length > 0);
    });

    // Remove duplicates and limit to top areas
    const uniqueAreas = [...new Set(allAreas)];
    return uniqueAreas.slice(0, 10).join('; ');
  }

  combineRepairRequirements(results) {
    const allRequirements = results.flatMap(r => {
      if (!r.repairRequirements) return [];
      return r.repairRequirements.split(/[•\-*\n]/).map(req => req.trim()).filter(req => req.length > 0);
    });

    const uniqueRequirements = [...new Set(allRequirements)];
    return uniqueRequirements.slice(0, 8).join('; ');
  }

  combinePotentialCauses(results) {
    const allCauses = results.flatMap(r => {
      if (!r.potentialCauses) return [];
      return r.potentialCauses.split(/[•\-*\n]/).map(cause => cause.trim()).filter(cause => cause.length > 0);
    });

    const uniqueCauses = [...new Set(allCauses)];
    return uniqueCauses.slice(0, 6).join('; ');
  }

  combineSafetyConcerns(results) {
    const allConcerns = results.flatMap(r => {
      if (!r.safetyConcerns) return [];
      return r.safetyConcerns.split(/[•\-*\n]/).map(concern => concern.trim()).filter(concern => concern.length > 0);
    });

    const uniqueConcerns = [...new Set(allConcerns)];
    return uniqueConcerns.slice(0, 5).join('; ');
  }

  combineImmediateActions(results) {
    const allActions = results.flatMap(r => {
      if (!r.immediateActions) return [];
      return r.immediateActions.split(/[•\-*\n]/).map(action => action.trim()).filter(action => action.length > 0);
    });

    const uniqueActions = [...new Set(allActions)];
    return uniqueActions.slice(0, 7).join('; ');
  }

  combineFullReports(results) {
    const reports = results.map((result, index) =>
      `=== Analysis from Image ${index + 1} ===\n${result.fullReport || 'No detailed analysis available.'}`
    );

    return `Comprehensive Analysis from ${results.length} Images:\n\n${reports.join('\n\n')}\n\n=== Combined Assessment ===\nThis assessment combines findings from ${results.length} images to provide a comprehensive view of the damage.`;
  }

  // Report Generation Method
  async generateReport(analysisData, userDetails = {}) {
    const report = {
      // Include fields directly for backward compatibility
      damageType: analysisData.damageType || 'Not specified',
      severityLevel: analysisData.severityLevel || 'Not specified',
      affectedAreas: analysisData.affectedAreas || 'Not specified',
      repairRequirements: analysisData.repairRequirements || 'Not specified',
      potentialCauses: analysisData.potentialCauses || 'Not specified',
      safetyConcerns: analysisData.safetyConcerns || 'Not specified',
      immediateActions: analysisData.immediateActions || 'Not specified',
      fullReport: analysisData.fullReport || 'No analysis available.',

      metadata: {
        title: 'Insurance Loss Assessment Report',
        generatedAt: new Date().toISOString(),
        claimant: userDetails.name || 'Not specified',
        policyNumber: userDetails.policyNumber || 'Not specified',
        incidentDate: userDetails.incidentDate || 'Not specified',
        location: userDetails.location || 'Not specified',
        assessmentModel: 'Google Gemini Pro Vision'
      },
      executiveSummary: {
        damageType: analysisData.damageType || 'Not specified',
        severity: analysisData.severityLevel || 'Not specified',
        keyFindings: analysisData.affectedAreas || 'Not specified',
        immediateConcerns: analysisData.safetyConcerns || 'Not specified'
      },
      detailedAnalysis: {
        damageAssessment: analysisData.damageType,
        severityEvaluation: analysisData.severityLevel,
        affectedComponents: analysisData.affectedAreas,
        repairRequirements: analysisData.repairRequirements,
        probableCauses: analysisData.potentialCauses,
        safetyAssessment: analysisData.safetyConcerns,
        recommendedActions: analysisData.immediateActions
      },
      disclaimer: 'This report was generated by AI and should be reviewed by a qualified claims adjuster. The information provided is for guidance purposes only and does not constitute professional advice.'
    };

    // Store this report context for chat
    this.reportContext = report;

    return report;
  }

  // Method to export report as text
  exportReportAsText(report) {
    return `
# ${report.metadata.title}
Generated: ${new Date(report.metadata.generatedAt).toLocaleDateString()}

## Claim Information
- Claimant: ${report.metadata.claimant}
- Policy Number: ${report.metadata.policyNumber}
- Incident Date: ${report.metadata.incidentDate}
- Location: ${report.metadata.location}
- Assessment Model: ${report.metadata.assessmentModel}

## Executive Summary
**Damage Type**: ${report.executiveSummary.damageType}
**Severity Level**: ${report.executiveSummary.severity}
**Key Findings**: ${report.executiveSummary.keyFindings}
**Immediate Concerns**: ${report.executiveSummary.immediateConcerns}

## Detailed Analysis

### Damage Assessment
${report.detailedAnalysis.damageAssessment}

### Severity Evaluation
${report.detailedAnalysis.severityEvaluation}

### Affected Components
${report.detailedAnalysis.affectedComponents}

### Repair Requirements
${report.detailedAnalysis.repairRequirements}

### Probable Causes
${report.detailedAnalysis.probableCauses}

### Safety Assessment
${report.detailedAnalysis.safetyAssessment}

### Recommended Actions
${report.detailedAnalysis.recommendedActions}

## Complete AI Analysis
${report.fullReport}

---

${report.disclaimer}
    `;
  }
}

// Create and export a singleton instance
const geminiApiService = new GeminiApiService();

// Export methods individually (named exports)
export const generateChatResponse = (userMessage, context) => geminiApiService.generateChatResponse(userMessage, context);
export const analyzeImageWithGemini = (imageFile, prompt) => geminiApiService.analyzeImageWithGemini(imageFile, prompt);
export const generateReport = (analysisData, userDetails) => geminiApiService.generateReport(analysisData, userDetails);
export const getChatHistory = () => geminiApiService.getChatHistory();
export const clearChatHistory = () => geminiApiService.clearChatHistory();
export const setReportContext = (context) => geminiApiService.setReportContext(context);
export const getReportContext = () => geminiApiService.getReportContext();
export const exportReportAsText = (report) => geminiApiService.exportReportAsText(report);

// Also export the default instance
export default geminiApiService;