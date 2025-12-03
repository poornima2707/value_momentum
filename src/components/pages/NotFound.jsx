import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '120px', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '24px' }}>
        404
      </div>
      <h1 style={{ marginBottom: '16px' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '18px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound