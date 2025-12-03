const QWEN_API_KEY = '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'; // Same as LLaVA
const QWEN_BASE_URL = 'https://openrouter.ai/api/v1'; // Same as LLaVA
const QWEN_MODEL = 'qwen/qwen3-vl-8b-instruct'; // Same model as LLaVA

class QwenService {
  constructor() {
    this.apiKey = QWEN_API_KEY;
    this.baseUrl = QWEN_BASE_URL;
    this.model = QWEN_MODEL;
  }

  // Chat with Qwen model using OpenRouter (same as LLaVA)
  async chat(messages, model = this.model) {
    try {
      console.log('Chatting with Qwen API (OpenRouter)...');

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Loss Assessment App'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Qwen API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        text: data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.",
        message: {
          content: data.choices?.[0]?.message?.content || ""
        },
        raw: data
      };
    } catch (error) {
      console.error('Error in Qwen chat:', error);
      throw error;
    }
  }

  // Generate text response for chatbot
  async generateChatResponse(message, context = {}) {
    try {
      const systemPrompt = `You are a helpful insurance loss assessment assistant. You help users understand their assessment reports, claim processes, and provide general assistance.

${context.generatedReport ? `Context from user's report: ${JSON.stringify(context.generatedReport)}` : ''}
${context.metadata ? `Additional context: ${JSON.stringify(context.metadata)}` : ''}

Please provide helpful, accurate, and concise responses. If you don't have enough information, ask for clarification.`;

      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ];

      const response = await this.chat(messages);
      return response.text;
    } catch (error) {
      console.error('Error generating Qwen chat response:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const qwenService = new QwenService();

// Export methods individually (named exports)
export const chat = (messages, model) => qwenService.chat(messages, model);
export const generateChatResponse = (message, context) => qwenService.generateChatResponse(message, context);

// Also export the default instance
export default qwenService;
