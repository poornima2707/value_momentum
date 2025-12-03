import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, Settings, MessageCircle, Bot } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: <Home size={20} />,
    },
    {
      path: '/assessment',
      label: 'Assessment',
      icon: <FileText size={20} />,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
    {
      path: '/chatbot',
      label: 'Chat',
      icon: <MessageCircle size={20} />,
    },
  ]

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <Bot size={24} />
            <span>Loss Assessment</span>
          </Link>

          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header