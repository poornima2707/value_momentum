import React, { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import ChatbotInterface from './ChatbotInterface';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const handleReportGenerated = (report) => {
    console.log('Report generated:', report);
    // You can add additional handling here, like sending to parent component
  };

  return (
    <div className="chat-widget">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          className="chat-widget-button"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
          <span className="pulse-dot"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chat-window-header">
            <div className="chat-window-title">
              <MessageCircle size={20} />
              <span>AI Loss Assistant</span>
            </div>
            <div className="chat-window-actions">
              <button 
                className="icon-button"
                onClick={minimizeChat}
                aria-label="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
              <button 
                className="icon-button"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="chat-window-content">
              <ChatbotInterface onReportGenerated={handleReportGenerated} />
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .chat-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
          transition: all 0.3s ease;
          position: relative;
        }

        .chat-widget-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }

        .pulse-dot {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 1; }
        }

        .chat-window {
          width: 450px;
          height: 700px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 12px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .chat-window.minimized {
          height: auto;
        }

        .chat-window-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: var(--primary-color);
          color: white;
        }

        .chat-window-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .chat-window-actions {
          display: flex;
          gap: 8px;
        }

        .icon-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .chat-window-content {
          flex: 1;
          overflow: hidden;
        }

        @media (max-width: 480px) {
          .chat-widget {
            bottom: 10px;
            right: 10px;
          }

          .chat-window {
            width: calc(100vw - 20px);
            height: 70vh;
            right: 10px;
            bottom: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;