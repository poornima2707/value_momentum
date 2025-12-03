import React, { useState, useRef, useEffect } from 'react'
import { Send, Download } from 'lucide-react'
import { generateReport } from '../../services/geminiApi'

const ChatInterface = ({ images, metadata, isAnalyzing }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isAnalyzing && images.length > 0) {
      const analysisMessage = {
        id: Date.now(),
        type: 'bot',
        content: `I've received ${images.length} image(s) for ${metadata.lossType} assessment. Analyzing the damage...`,
        timestamp: new Date()
      }
      setMessages([analysisMessage])
    }
  }, [isAnalyzing, images.length, metadata.lossType])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I understand. I'm analyzing the images and details you've provided. Would you like me to generate a comprehensive report now?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  const handleGenerateReport = async () => {
    if (images.length === 0) {
      alert('Please upload images first')
      return
    }

    setIsGenerating(true)
    try {
      // Convert images to base64 for Gemini API
      const imagePromises = images.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      })

      const imageBase64Array = await Promise.all(imagePromises)
      
      const generatedReport = await generateReport({
        images: imageBase64Array,
        metadata: metadata
      })

      setReport(generatedReport)
      
      const reportMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I've generated a comprehensive loss assessment report. You can review and download it below.",
        timestamp: new Date(),
        report: generatedReport
      }
      
      setMessages(prev => [...prev, reportMessage])
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    
    const element = document.createElement("a")
    const file = new Blob([report], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `loss-assessment-report-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h3>AI Assessment Assistant</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Ask questions and get detailed analysis
        </p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.type}`}>
            <div>{message.content}</div>
            {message.report && (
              <div style={{ marginTop: '16px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={downloadReport}
                  style={{ marginRight: '8px' }}
                >
                  <Download size={16} />
                  Download Report
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setReport(message.report)}
                >
                  View Report
                </button>
              </div>
            )}
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.7, 
              marginTop: '8px',
              textAlign: message.type === 'user' ? 'right' : 'left'
            }}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="message message-bot">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              Generating report...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Send size={16} />
          </button>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={handleGenerateReport}
          disabled={isGenerating || images.length === 0}
          style={{ width: '100%', marginTop: '12px' }}
        >
          {isGenerating ? 'Generating Report...' : 'Generate Full Report'}
        </button>
      </div>

      {/* Report Preview Modal */}
      {report && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--border-radius-lg)',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2>Loss Assessment Report</h2>
              <button 
                onClick={() => setReport(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer' 
                }}
              >
                ×
              </button>
            </div>
            
            <pre style={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              lineHeight: '1.6'
            }}>
              {report}
            </pre>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px',
              justifyContent: 'center'
            }}>
              <button 
                className="btn btn-primary"
                onClick={downloadReport}
              >
                <Download size={16} />
                Download Report
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatInterface