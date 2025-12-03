import React, { useState, useEffect } from 'react'
import { Moon, Sun, Bell, BellOff, Globe, Shield, User } from 'lucide-react'

const Settings = () => {
  // Inject CSS styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .settings-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .settings-header h1 {
        font-size: 32px;
        margin-bottom: 8px;
        color: var(--text-primary);
      }

      .settings-header p {
        color: var(--text-secondary);
        font-size: 16px;
      }

      .settings-grid {
        display: grid;
        gap: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      .settings-section {
        background: var(--surface-color);
        border-radius: var(--border-radius-lg);
        padding: 24px;
        border: 1px solid var(--border-color);
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }

      .section-icon {
        width: 48px;
        height: 48px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .section-header h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        color: var(--text-primary);
      }

      .section-header p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .theme-options {
        display: flex;
        gap: 12px;
      }

      .theme-option {
        flex: 1;
        padding: 16px;
        border: 2px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--background-color);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .theme-option:hover {
        border-color: var(--primary-color);
      }

      .theme-option.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      .toggle-switch {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--border-color);
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .toggle-label {
        font-weight: 500;
        color: var(--text-primary);
      }

      .language-select {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--background-color);
        color: var(--text-primary);
        font-size: 14px;
        cursor: pointer;
      }

      .language-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .privacy-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .privacy-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-color);
      }

      .privacy-option:last-child {
        border-bottom: none;
      }

      .privacy-option span {
        font-weight: 500;
        color: var(--text-primary);
      }

      .account-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .account-actions button {
        padding: 12px 24px;
        border: none;
        border-radius: var(--border-radius);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-secondary {
        background: var(--surface-color);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }

      .btn-secondary:hover {
        background: var(--background-color);
      }

      .btn-danger {
        background: var(--error-color, #dc2626);
        color: white;
      }

      .btn-danger:hover {
        background: var(--error-color-dark, #b91c1c);
      }

      @media (max-width: 768px) {
        .settings-section {
          padding: 20px;
        }

        .section-header {
          flex-direction: column;
          text-align: center;
          gap: 12px;
        }

        .theme-options {
          flex-direction: column;
        }

        .toggle-switch {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedNotifications = localStorage.getItem('notifications') !== 'false'
    const savedLanguage = localStorage.getItem('language') || 'en'

    setTheme(savedTheme)
    setNotifications(savedNotifications)
    setLanguage(savedLanguage)

    // Apply theme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleNotificationsChange = (enabled) => {
    setNotifications(enabled)
    localStorage.setItem('notifications', enabled)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  return (
    <div className="container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your experience</p>
      </div>

      <div className="settings-grid">
        {/* Theme Settings */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3>Theme</h3>
              <p>Choose your preferred theme</p>
            </div>
          </div>
          <div className="theme-options">
            <button
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={16} />
              Dark
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              {notifications ? <Bell size={20} /> : <BellOff size={20} />}
            </div>
            <div>
              <h3>Notifications</h3>
              <p>Manage notification preferences</p>
            </div>
          </div>
          <div className="toggle-switch">
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => handleNotificationsChange(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">
              {notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Language */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Globe size={20} />
            </div>
            <div>
              <h3>Language</h3>
              <p>Select your preferred language</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>

        {/* Privacy */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Shield size={20} />
            </div>
            <div>
              <h3>Privacy</h3>
              <p>Control your privacy settings</p>
            </div>
          </div>
          <div className="privacy-options">
            <div className="privacy-option">
              <span>Data Collection</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="privacy-option">
              <span>Analytics</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <User size={20} />
            </div>
            <div>
              <h3>Account</h3>
              <p>Manage your account settings</p>
            </div>
          </div>
          <div className="account-actions">
            <button className="btn btn-secondary">Change Password</button>
            <button className="btn btn-secondary">Export Data</button>
            <button className="btn btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
