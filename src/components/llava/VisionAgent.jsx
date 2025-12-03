import React, { useState, useRef } from 'react';
import {
  MessageCircle,
  Camera,
  Zap,
  Search,
  Target,
  BarChart,
  TrendingUp,
  AlertCircle,
  Bot
} from 'lucide-react';
import { generateChatResponse as geminiChatResponse } from '../services/geminiApi';
import { generateChatResponse as qwenChatResponse } from '../services/qwenApi';

const VisionAgent = ({ onAnalysisRequest, onQuestionAsk }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [selectedAI, setSelectedAI] = useState('gemini'); // 'gemini' or 'qwen'
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What damage can you see in this image?",
    "How severe is this damage?",
    "Estimate repair costs for this damage",
    "Are there any safety hazards?",
    "Compare before and after images",
    "What caused this damage?"
  ]);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const imageBase64 = e.target.result;
      
      // Add user message
      const userMessage = {
        type: 'user',
        content: 'Uploaded an image for analysis',
        image: imageBase64,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, userMessage]);
      setIsProcessing(true);

      try {
        // Ask the selected AI to describe the image
        const response = selectedAI === 'qwen'
          ? await qwenChatResponse(
              "Describe what you see in this image, focusing on any visible damage, issues, or noteworthy features.",
              imageBase64
            )
          : await geminiChatResponse(
              "Describe what you see in this image, focusing on any visible damage, issues, or noteworthy features.",
              imageBase64
            );

        const botMessage = {
          type: 'bot',
          content: response,
          timestamp: new Date(),
          analysis: true
        };

        setConversation(prev => [...prev, botMessage]);

        // Update suggested questions based on response
        updateSuggestedQuestions(response);

        if (onAnalysisRequest) {
          onAnalysisRequest(imageBase64, response);
        }

      } catch (error) {
        console.error('Vision analysis error:', error);

        const errorMessage = {
          type: 'error',
          content: 'Unable to analyze image. Please try again.',
          timestamp: new Date()
        };

        setConversation(prev => [...prev, errorMessage]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleQuestion = async (question) => {
    if (!question.trim()) return;

    // Check if we have an image in conversation
    const lastImage = conversation.findLast(msg => msg.image);
    
    if (!lastImage) {
      const noImageMessage = {
        type: 'bot',
        content: 'Please upload an image first to ask questions about it.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, noImageMessage]);
      return;
    }

    // Add user question
    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = selectedAI === 'qwen'
        ? await qwenChatResponse(question, lastImage.image)
        : await geminiChatResponse(question, lastImage.image);

      const botMessage = {
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, botMessage]);

      if (onQuestionAsk) {
        onQuestionAsk(question, response);
      }

    } catch (error) {
      console.error('Question error:', error);
      
      const errorMessage = {
        type: 'error',
        content: 'Unable to process question. Please try again.',
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSuggestedQuestions = (analysis) => {
    // Extract keywords from analysis to generate relevant questions
    const keywords = extractKeywords(analysis);
    
    const newQuestions = [
      `How severe is the damage?`,
      `What would it cost to repair?`,
      `Are there any safety issues?`,
      `What caused this?`,
      `How long would repairs take?`,
      `What are the immediate steps?`
    ];

    setSuggestedQuestions(newQuestions);
  };

  const extractKeywords = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  };

  const quickActions = [
    {
      icon: Camera,
      label: 'Upload Image',
      action: () => fileInputRef.current?.click(),
      color: 'blue'
    },
    {
      icon: Search,
      label: 'Damage Scan',
      action: () => handleQuestion('Scan for all visible damage'),
      color: 'red'
    },
    {
      icon: Target,
      label: 'Focus Area',
      action: () => handleQuestion('Identify the most critical area'),
      color: 'orange'
    },
    {
      icon: BarChart,
      label: 'Severity',
      action: () => handleQuestion('Rate the severity 1-10'),
      color: 'purple'
    },
    {
      icon: TrendingUp,
      label: 'Cost Estimate',
      action: () => handleQuestion('Provide cost estimate'),
      color: 'green'
    }
  ];

  return (
    <div className="vision-agent">
      {/* Header */}
      <div className="agent-header">
        <div className="agent-title">
          <Zap size={24} />
          <div>
            <h3>Vision AI Agent</h3>
            <p>Powered by {selectedAI === 'qwen' ? 'Qwen VL' : 'Gemini'} - Visual Language Assistant</p>
          </div>
        </div>
        <div className="agent-controls">
          <div className="ai-selector">
            <button
              className={`ai-option ${selectedAI === 'gemini' ? 'active' : ''}`}
              onClick={() => setSelectedAI('gemini')}
              disabled={isProcessing}
            >
              <Zap size={16} />
              Gemini
            </button>
            <button
              className={`ai-option ${selectedAI === 'qwen' ? 'active' : ''}`}
              onClick={() => setSelectedAI('qwen')}
              disabled={isProcessing}
            >
              <Bot size={16} />
              Qwen
            </button>
          </div>
          <div className="agent-status">
            <div className={`status-dot ${isProcessing ? 'processing' : 'ready'}`}></div>
            <span>{isProcessing ? `Processing with ${selectedAI === 'qwen' ? 'Qwen' : 'Gemini'}...` : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="quick-action-btn"
              onClick={action.action}
              disabled={isProcessing}
              style={{ '--action-color': action.color }}
            >
              <Icon size={20} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* Conversation */}
      <div className="conversation">
        {conversation.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} />
            <h4>Start a Visual Conversation</h4>
            <p>Upload an image or ask questions about damage assessment</p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.image && (
                <div className="message-image">
                  <img src={msg.image} alt="Uploaded" />
                </div>
              )}
              <div className="message-content">
                {msg.content}
              </div>
              <div className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {msg.analysis && (
                <div className="analysis-badge">
                  <Zap size={12} />
                  AI Analysis
                </div>
              )}
            </div>
          ))
        )}

        {isProcessing && (
          <div className="processing-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Analyzing with {selectedAI === 'qwen' ? 'Qwen' : 'LLaVA'}...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="suggested-questions">
          <h4>Suggested Questions:</h4>
          <div className="question-chips">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="question-chip"
                onClick={() => handleQuestion(question)}
                disabled={isProcessing}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuestion(input)}
          placeholder="Ask about the image or upload a new one..."
          disabled={isProcessing}
        />
        <button
          className="send-btn"
          onClick={() => handleQuestion(input)}
          disabled={!input.trim() || isProcessing}
        >
          <MessageCircle size={20} />
        </button>
      </div>

      <style jsx>{`
        .vision-agent {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 600px;
        }

        .agent-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .agent-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .agent-title h3 {
          margin: 0;
          font-size: 18px;
        }

        .agent-title p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .agent-controls {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .ai-selector {
          display: flex;
          gap: 8px;
        }

        .ai-option {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ai-option:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .ai-option.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
          font-weight: 500;
        }

        .ai-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .agent-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.ready {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .status-dot.processing {
          background: #f59e0b;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .quick-actions {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: #f8fafc;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          background: white;
          color: var(--text-primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .quick-action-btn:hover:not(:disabled) {
          background: var(--action-color, var(--primary-color));
          color: white;
          border-color: var(--action-color, var(--primary-color));
          transform: translateY(-1px);
        }

        .quick-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .conversation {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .empty-state h4 {
          margin: 16px 0 8px 0;
          color: var(--text-primary);
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          position: relative;
        }

        .message.user {
          align-self: flex-end;
          background: var(--primary-color);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot {
          align-self: flex-start;
          background: #f1f5f9;
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .message.error {
          align-self: center;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .message-image {
          margin-bottom: 8px;
          border-radius: 8px;
          overflow: hidden;
        }

        .message-image img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 6px;
        }

        .message-content {
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
          text-align: right;
        }

        .analysis-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .processing-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f1f5f9;
          border-radius: 12px;
          align-self: flex-start;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .suggested-questions {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          background: #f8fafc;
        }

        .suggested-questions h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-primary);
        }

        .question-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .question-chip {
          padding: 6px 12px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .question-chip:hover:not(:disabled) {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .question-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-area {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          background: white;
        }

        .input-area input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 24px;
          outline: none;
          font-size: 14px;
        }

        .input-area input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .quick-actions {
            flex-wrap: wrap;
          }
          
          .question-chips {
            flex-direction: column;
          }
          
          .message {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default VisionAgent;