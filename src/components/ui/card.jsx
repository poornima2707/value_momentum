import React from 'react';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'medium',
  hover = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseStyles = {
    background: 'var(--surface-color)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  const variants = {
    default: {
      boxShadow: 'var(--shadow-sm)'
    },
    elevated: {
      boxShadow: 'var(--shadow-md)'
    },
    outlined: {
      boxShadow: 'none',
      border: '1px solid var(--border-color)'
    },
    filled: {
      boxShadow: 'none',
      background: '#f8fafc',
      border: 'none'
    }
  };

  const paddingSizes = {
    none: { padding: '0' },
    small: { padding: '16px' },
    medium: { padding: '24px' },
    large: { padding: '32px' }
  };

  const hoverStyles = hover ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-lg)',
      borderColor: 'var(--primary-color)'
    }
  } : {};

  const styles = {
    ...baseStyles,
    ...variants[variant],
    ...paddingSizes[padding],
    cursor: onClick ? 'pointer' : 'default'
  };

  const mergedStyles = { ...styles };

  return (
    <div
      style={mergedStyles}
      className={`card ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      
      <style jsx>{`
        .card:hover {
          ${hover && `
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-color);
          `}
        }
      `}</style>
    </div>
  );
};

// Card Sub-components
const CardHeader = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: '24px 24px 0 24px'
    }}
    className={`card-header ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: '24px'
    }}
    className={`card-content ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: '0 24px 24px 24px',
      borderTop: '1px solid var(--border-color)',
      paddingTop: '24px'
    }}
    className={`card-footer ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3
    style={{
      margin: '0 0 8px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-primary)'
    }}
    className={`card-title ${className}`}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p
    style={{
      margin: '0',
      fontSize: '14px',
      color: 'var(--text-secondary)',
      lineHeight: '1.5'
    }}
    className={`card-description ${className}`}
    {...props}
  >
    {children}
  </p>
);

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;