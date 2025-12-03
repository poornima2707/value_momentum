import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/ui/Header'
import Footer from './components/ui/Footer'
import Home from './components/pages/Home'
import Assessment from './components/pages/Assessment'
import Settings from './components/pages/Settings'
import NotFound from './components/pages/NotFound'
import GeminiAnalysis from './components/gemini/GeminiAnalysis'
import TestGemini from './components/gemini/TestGemini'
import ChatbotInterface from './components/chatbot/ChatbotInterface'
import './App.css'

function App() {
  // Check if Gemini API key is configured
  const hasGeminiKey = import.meta.env.VITE_GEMINI_API_KEY &&
                      import.meta.env.VITE_GEMINI_API_KEY !== 'AIzaSyA2gLYbHzlc3jM8UNRD3u_oRwZ5vS2s7QQ';

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chatbot" element={<ChatbotInterface />} />
              <Route
                path="/gemini-analysis"
                element={hasGeminiKey ? <GeminiAnalysis /> : <TestGemini />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App