import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, RefreshCw } from 'lucide-react';
import { generateChatResponse } from '../services/geminiApi';
import { generateChatResponse as qwenChatResponse } from '../services/qwenApi';

const ChatbotInterface = ({ images, metadata, generatedReport }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your Loss Assessment Assistant. I can help you understand the generated report, answer questions about the claim process, or provide general assistance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState('gemini'); // 'gemini' or 'llava'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-suggest questions when report is available
  useEffect(() => {
    if (generatedReport && messages.length === 1) {
      const suggestionMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I see you have a generated report! You can ask me questions about:\n• Specific sections of your report\n• Claim process guidance\n• Understanding damage severity\n• Next steps recommendations",
        timestamp: new Date(),
        showSuggestions: true
      };
      setMessages(prev => [...prev, suggestionMessage]);
    }
  }, [generatedReport]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let botResponse;

      if (selectedAI === 'gemini') {
        // Prepare context for Gemini AI
        const context = {
          images: images,
          metadata: metadata,
          generatedReport: generatedReport,
          conversationHistory: messages.slice(-5)
        };

        botResponse = await generateChatResponse(inputMessage, context);
      } else if (selectedAI === 'llava') {
        // Prepare context for Qwen AI
        const context = {
          images: images,
          metadata: metadata,
          generatedReport: generatedReport,
          conversationHistory: messages.slice(-5)
        };

        botResponse = await qwenChatResponse(inputMessage, context);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your request. Please try again or check your connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const downloadChat = () => {
    const chatText = messages.map(msg => 
      `${msg.type === 'user' ? 'You' : 'Assistant'} (${msg.timestamp.toLocaleString()}): ${msg.content}`
    ).join('\n\n');

    const element = document.createElement('a');
    const file = new Blob([chatText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `chat-conversation-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const quickQuestions = generatedReport ? [
    { id: 'report_summary', label: 'Summarize my report', question: 'Can you give me a brief summary of my assessment report?' },
    { id: 'next_steps', label: 'What are next steps?', question: 'What should I do next based on this report?' },
    { id: 'claim_help', label: 'Help with insurance claim', question: 'How do I file an insurance claim with this report?' },
    { id: 'severity_explain', label: 'Explain damage severity', question: 'Can you explain the damage severity mentioned in the report?' }
  ] : [
    { id: 'claim_process', label: 'Claim process', question: 'How does the insurance claim process work?' },
    { id: 'loss_types', label: 'Types of losses', question: 'What types of losses can you help assess?' },
    { id: 'document_needed', label: 'Documents needed', question: 'What documents do I need for an insurance claim?' },
    { id: 'assessment_help', label: 'Assessment help', question: 'How do I start a loss assessment?' }
  ];

  return (
    <div className="chatbot-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-content">
          <Bot size={24} />
          <div>
            <h3>AI Assistant</h3>
            <p>Get help with your report and claim process</p>
          </div>
        </div>
        <button
          className="download-chat-btn"
          onClick={downloadChat}
          title="Download Chat History"
        >
          <Download size={16} />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-avatar">
              {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {message.showSuggestions && (
                <div className="suggestions">
                  <p>Try asking:</p>
                  <div className="suggestion-buttons">
                    <button onClick={() => handleQuickQuestion('Explain the damage severity in my report')}>
                      Explain damage severity
                    </button>
                    <button onClick={() => handleQuickQuestion('What should I do next?')}>
                      Next steps
                    </button>
                    <button onClick={() => handleQuickQuestion('Help me understand the recommendations')}>
                      Understand recommendations
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* AI Model Selection */}
      <div className="ai-selection">
        <p>Select AI Model:</p>
        <div className="ai-buttons">
          <button
            className={`ai-btn ${selectedAI === 'gemini' ? 'active' : ''}`}
            onClick={() => setSelectedAI('gemini')}
          >
            <img
              src="https://www.gstatic.com/lamda/images/gemini_favicon_light_b38a1ce2fd4c57ff.svg"
              alt="Gemini"
              width={16}
              height={16}
              style={{ marginRight: '6px' }}
            />
            Gemini AI
          </button>
          <button
            className={`ai-btn ${selectedAI === 'llava' ? 'active' : ''}`}
            onClick={() => setSelectedAI('llava')}
          >
            <Bot size={16} style={{ marginRight: '6px' }} />
            Qwen AI
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        <p>Quick questions:</p>
        <div className="question-buttons">
          {quickQuestions.map(q => (
            <button
              key={q.id}
              className="question-btn"
              onClick={() => handleQuickQuestion(q.question)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about your report, claim process, or get assistance..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send • Ask about your report, claim process, or get general help
        </div>
      </div>

      <style jsx>{`
        .chatbot-interface {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
          max-width: 100%;
        }

        .bot-message {
          align-self: flex-start;
        }

        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bot-message .message-avatar {
          background: var(--primary-color);
          color: white;
        }

        .user-message .message-avatar {
          background: var(--secondary-color);
          color: white;
        }

        .message-content {
          max-width: 75%;
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
        }

        .bot-message .message-content {
          background: #ffffff;
          color: #374151;
          border-bottom-left-radius: 6px;
        }

        .message-text {
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .user-message .message-time {
          text-align: right;
        }

        .suggestions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .suggestions p {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .suggestion-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-buttons button {
          background: rgba(37, 99, 235, 0.1);
          border: 1px solid rgba(37, 99, 235, 0.2);
          color: var(--primary-color);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggestion-buttons button:hover {
          background: rgba(37, 99, 235, 0.2);
        }

        .quick-questions {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          background: #f8fafc;
        }

        .quick-questions p {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .question-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .question-btn {
          background: white;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .question-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .ai-selection {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          background: #f8fafc;
        }

        .ai-selection p {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .ai-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ai-btn {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #374151;
          padding: 10px 18px;
          border-radius: 24px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .ai-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .ai-btn.active {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .chat-input-area {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          background: var(--surface-color);
        }

        .input-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 24px;
          outline: none;
          font-size: 14px;
        }

        .chat-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .send-button {
          border-radius: 50%;
          width: 44px;
          height: 44px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-hint {
          font-size: 11px;
          color: var(--text-secondary);
          text-align: center;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-secondary);
          animation: bounce 1.4s infinite ease-in-out;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .message-content {
            max-width: 85%;
          }
          
          .question-buttons {
            flex-direction: column;
          }
          
          .question-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotInterface;