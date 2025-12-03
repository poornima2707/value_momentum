import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Upload, 
  MessageCircle, 
  FileText, 
  Zap, 
  Shield, 
  CheckCircle 
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: <Upload />,
      title: 'Image Analysis',
      description: 'Upload photos and let AI analyze damage with precision'
    },
    {
      icon: <MessageCircle />,
      title: 'Interactive Chat',
      description: 'Clarify details through intelligent conversation'
    },
    {
      icon: <FileText />,
      title: 'Professional Reports',
      description: 'Generate formatted insurance-grade documentation'
    },
    {
      icon: <Zap />,
      title: 'Fast Processing',
      description: 'Get results in seconds with advanced AI models'
    },
    {
      icon: <Shield />,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise security'
    },
    {
      icon: <CheckCircle />,
      title: 'Accurate Assessment',
      description: 'AI-powered evaluation with confidence scoring'
    }
  ]

  const lossCategories = [
    {
      title: 'Property Damage',
      items: ['Fire', 'Flood', 'Earthquake', 'Roof damage']
    },
    {
      title: 'Agricultural',
      items: ['Crop damage', 'Farm equipment', 'Livestock']
    },
    {
      title: 'Vehicle Damage',
      items: ['Collision', 'Hail', 'Fire', 'Comprehensive']
    },
    {
      title: 'Natural Disaster',
      items: ['Hurricane', 'Tornado', 'Tsunami', 'Earthquake']
    },
    {
      title: 'Commercial Loss',
      items: ['Factory', 'Warehouse', 'Equipment damage']
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>AI-Powered Loss Description Generator</h1>
          <p>Transform photos into professional insurance reports in minutes. Upload images, answer AI questions, and generate comprehensive loss assessments instantly.</p>
          <Link to="/assessment" className="btn btn-primary btn-lg">
            Start Assessment
          </Link>
        </div>
      </section>

      {/* Why Choose Our Platform */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '36px' }}>
          Why Choose Our Platform?
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="card feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Loss Categories */}
      <section style={{ marginTop: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '36px' }}>
          Supported Loss Categories
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '48px', fontSize: '18px', color: 'var(--text-secondary)' }}>
          Our AI handles multiple types of damage assessment with specialized analysis for each category
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          {lossCategories.map((category, index) => (
            <div key={index} className="card" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>{category.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} color="var(--success-color)" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginTop: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '36px' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--primary-color)', 
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>1</div>
            <h3 style={{ marginBottom: '16px' }}>Upload Images</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Take clear photos of the damage from multiple angles and upload them to our platform
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--primary-color)', 
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>2</div>
            <h3 style={{ marginBottom: '16px' }}>Provide Details</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Select loss type, incident details, and answer AI clarifying questions
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--primary-color)', 
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>3</div>
            <h3 style={{ marginBottom: '16px' }}>AI Analysis</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Our advanced AI analyzes images and generates observations with confidence scores
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--primary-color)', 
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>4</div>
            <h3 style={{ marginBottom: '16px' }}>Generate Report</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Get a professional, formatted loss assessment report ready for submission
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        marginTop: '80px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 40px',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <h2 style={{ marginBottom: '24px', fontSize: '32px' }}>
          Ready to Generate Your Report?
        </h2>
        <p style={{ marginBottom: '32px', fontSize: '18px', opacity: 0.9 }}>
          Start your loss assessment now and experience the power of AI-driven insurance documentation
        </p>
        <Link to="/assessment" className="btn btn-primary btn-lg" style={{ background: 'white', color: '#667eea' }}>
          Start Free Assessment
        </Link>
      </section>
    </div>
  )
}

export default Home