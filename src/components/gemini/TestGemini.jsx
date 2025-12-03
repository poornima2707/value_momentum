import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader, TestTube, MessageCircle } from 'lucide-react';
import geminiApiService from '../services/geminiApi';

const TestGemini = () => {
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [chatTest, setChatTest] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const handleApiKeyTest = async () => {
    setIsTesting(true);
    setTestStatus(null);

    try {
      // Test basic API connectivity with a simple chat message
      const response = await geminiApiService.generateChatResponse('Hello, can you confirm you are working?');

      if (response) {
        setTestStatus({
          success: true,
          message: 'Gemini API is working correctly!',
          details: 'API key is valid and connection is successful.'
        });
      }
    } catch (error) {
      console.error('API test failed:', error);
      setTestStatus({
        success: false,
        message: 'Gemini API test failed',
        details: error.message || 'Please check your API key and internet connection.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleChatTest = async () => {
    if (!chatTest.trim()) return;

    setIsTesting(true);
    try {
      const response = await geminiApiService.generateChatResponse(chatTest);
      setChatResponse(response);
    } catch (error) {
      setChatResponse(`Error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSetupInstructions = () => {
    alert('To use Gemini AI:\n\n1. Get API key from: https://makersuite.google.com/app/apikey\n2. Add to .env file: VITE_GEMINI_API_KEY=your_key_here\n3. Restart the app');
  };

  return (
    <div className="test-container">
      <div className="test-card">
        <TestTube size={48} className="test-icon" />
        <h2>Test Gemini AI Integration</h2>
        <p>
          Test your Gemini API configuration and functionality.
        </p>

        {/* API Key Test */}
        <div className="test-section">
          <h3>API Connection Test</h3>
          <p>Verify that your API key is configured correctly.</p>

          <button
            onClick={handleApiKeyTest}
            disabled={isTesting}
            className="test-btn primary"
          >
            {isTesting ? (
              <>
                <Loader size={20} className="spinning" />
                Testing API...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Test API Connection
              </>
            )}
          </button>

          {testStatus && (
            <div className={`test-result ${testStatus.success ? 'success' : 'error'}`}>
              {testStatus.success ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <div>
                <strong>{testStatus.message}</strong>
                <p>{testStatus.details}</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Test */}
        <div className="test-section">
          <h3>Chat Functionality Test</h3>
          <p>Test the chat capabilities of Gemini AI.</p>

          <div className="chat-test">
            <textarea
              value={chatTest}
              onChange={(e) => setChatTest(e.target.value)}
              placeholder="Enter a test message for Gemini AI..."
              rows={3}
              className="chat-input"
            />
            <button
              onClick={handleChatTest}
              disabled={isTesting || !chatTest.trim()}
              className="test-btn secondary"
            >
              {isTesting ? (
                <>
                  <Loader size={16} className="spinning" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle size={16} />
                  Send Message
                </>
              )}
            </button>
          </div>

          {chatResponse && (
            <div className="chat-response">
              <h4>Gemini Response:</h4>
              <div className="response-content">
                {chatResponse}
              </div>
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="setup-section">
          <h3>Need to Set Up API Key?</h3>
          <div className="steps">
            <ol>
              <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
              <li>Sign in with Google account</li>
              <li>Click "Get API Key"</li>
              <li>Create a new API key</li>
              <li>Add to your `.env` file:
                <pre>VITE_GEMINI_API_KEY=your_api_key_here</pre>
              </li>
              <li>Restart the development server</li>
            </ol>
          </div>

          <button onClick={handleSetupInstructions} className="setup-btn">
            Get Setup Instructions
          </button>
        </div>

        {/* Features */}
        <div className="features">
          <h3>Gemini AI Capabilities:</h3>
          <ul>
            <li><CheckCircle size={16} /> Image analysis for damage assessment</li>
            <li><CheckCircle size={16} /> Chat-based insurance guidance</li>
            <li><CheckCircle size={16} /> Report generation</li>
            <li><CheckCircle size={16} /> Safety hazard identification</li>
            <li><CheckCircle size={16} /> Repair cost estimation</li>
            <li><CheckCircle size={16} /> Claim process assistance</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .test-container {
          max-width: 900px;
          margin: 3rem auto;
          padding: 2rem;
        }

        .test-card {
          background: white;
          border-radius: 1rem;
          padding: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .test-icon {
          color: #3b82f6;
          margin-bottom: 1.5rem;
        }

        h2 {
          color: #1e293b;
          margin-bottom: 1rem;
          font-size: 2rem;
          text-align: center;
        }

        p {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 1.125rem;
          line-height: 1.6;
          text-align: center;
        }

        .test-section {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
        }

        .test-section h3 {
          color: #334155;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }

        .test-section p {
          color: #64748b;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .test-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: center;
        }

        .test-btn.primary {
          width: 100%;
        }

        .test-btn.secondary {
          width: auto;
          margin-top: 1rem;
        }

        .test-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .test-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .test-result {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .test-result.success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .test-result.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .test-result strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .chat-test {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chat-input {
          width: 100%;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
        }

        .chat-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .chat-response {
          margin-top: 1rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }

        .chat-response h4 {
          margin: 0 0 0.5rem 0;
          color: #374151;
          font-size: 1rem;
        }

        .response-content {
          color: #4b5563;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .setup-section {
          background: #fefce8;
          padding: 2rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          border: 1px solid #fde047;
        }

        .setup-section h3 {
          color: #92400e;
          margin-bottom: 1rem;
        }

        .steps ol {
          padding-left: 1.5rem;
          color: #78350f;
          margin-bottom: 1.5rem;
        }

        .steps li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .steps a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .steps a:hover {
          text-decoration: underline;
        }

        .steps pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          overflow-x: auto;
        }

        .setup-btn {
          background: #f59e0b;
          color: #92400e;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .setup-btn:hover {
          background: #d97706;
        }

        .features {
          text-align: left;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        .features h3 {
          color: #334155;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .features ul {
          list-style: none;
          padding: 0;
        }

        .features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: #475569;
        }

        .features li svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .test-container {
            padding: 1rem;
          }

          .test-card {
            padding: 2rem;
          }

          .test-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TestGemini;
