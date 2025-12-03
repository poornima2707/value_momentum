import { OpenRouter } from "@openrouter/sdk";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "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";

class OpenRouterService {
  constructor() {
    this.openrouter = new OpenRouter({
      apiKey: OPENROUTER_API_KEY
    });
  }

  // Generate images using Gemini model
  async generateImage(prompt = "Generate a beautiful sunset over mountains") {
    try {
      console.log('Generating image with OpenRouter Gemini model...');

      const result = await this.openrouter.chat.send({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      });

      const message = result.choices[0].message;

      if (message.images && message.images.length > 0) {
        const images = message.images.map((image, index) => ({
          index: index + 1,
          url: image.image_url.url,
          preview: image.image_url.url.substring(0, 50) + "..."
        }));

        console.log('Generated images:', images);

        return {
          success: true,
          images: images,
          text: message.content || "",
          raw: result
        };
      } else {
        return {
          success: false,
          error: "No images generated",
          text: message.content || "",
          raw: result
        };
      }
    } catch (error) {
      console.error('Error generating image with OpenRouter:', error);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.status === 401) {
          throw new Error(`OpenRouter API Error (401): Invalid API key. Please check your OpenRouter API key.`);
        } else if (error.response.status === 429) {
          throw new Error(`OpenRouter API Error (429): Rate limit exceeded. Please try again later.`);
        } else {
          throw new Error(`OpenRouter API Error (${error.response.status}): ${error.response.data?.error?.message || error.message}`);
        }
      } else if (error.request) {
        throw new Error('OpenRouter API Error: No response received. Please check your internet connection.');
      } else {
        throw new Error(`OpenRouter API Error: ${error.message}`);
      }
    }
  }

  // Generate text using Gemini model
  async generateText(prompt) {
    try {
      console.log('Generating text with OpenRouter Gemini model...');

      const result = await this.openrouter.chat.send({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["text"]
      });

      const message = result.choices[0].message;

      return {
        success: true,
        text: message.content || "",
        raw: result
      };
    } catch (error) {
      console.error('Error generating text with OpenRouter:', error);
      throw error;
    }
  }

  // Analyze image with text prompt
  async analyzeImage(imageUrl, prompt = "Analyze this image and describe what you see") {
    try {
      console.log('Analyzing image with OpenRouter Gemini model...');

      const result = await this.openrouter.chat.send({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["text"]
      });

      const message = result.choices[0].message;

      return {
        success: true,
        analysis: message.content || "",
        raw: result
      };
    } catch (error) {
      console.error('Error analyzing image with OpenRouter:', error);
      throw error;
    }
  }

  // Chat with multimodal capabilities
  async chat(messages, modalities = ["text"]) {
    try {
      console.log('Chatting with OpenRouter Gemini model...');

      const result = await this.openrouter.chat.send({
        model: "google/gemini-3-pro-image-preview",
        messages: messages,
        modalities: modalities
      });

      const message = result.choices[0].message;

      return {
        success: true,
        message: message,
        images: message.images || [],
        text: message.content || "",
        raw: result
      };
    } catch (error) {
      console.error('Error in chat with OpenRouter:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const openRouterService = new OpenRouterService();

// Export methods individually (named exports)
export const generateImage = (prompt) => openRouterService.generateImage(prompt);
export const generateText = (prompt) => openRouterService.generateText(prompt);
export const analyzeImage = (imageUrl, prompt) => openRouterService.analyzeImage(imageUrl, prompt);
export const analyzeImageWithLLaVA = (imageUrl, prompt) => openRouterService.analyzeImageWithLLaVA(imageUrl, prompt);
export const chat = (messages, modalities) => openRouterService.chat(messages, modalities);

// Also export the default instance
export default openRouterService;
