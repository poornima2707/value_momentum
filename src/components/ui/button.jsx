import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: 'var(--border-radius)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  const variants = {
    primary: {
      background: 'var(--primary-color)',
      color: 'white',
      border: '1px solid var(--primary-color)'
    },
    secondary: {
      background: 'var(--surface-color)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)'
    },
    danger: {
      background: 'var(--error-color)',
      color: 'white',
      border: '1px solid var(--error-color)'
    },
    success: {
      background: 'var(--success-color)',
      color: 'white',
      border: '1px solid var(--success-color)'
    },
    warning: {
      background: 'var(--warning-color)',
      color: 'white',
      border: '1px solid var(--warning-color)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid transparent'
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary-color)',
      border: '1px solid var(--primary-color)'
    }
  };

  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
      height: '32px'
    },
    medium: {
      padding: '12px 24px',
      fontSize: '14px',
      height: '40px'
    },
    large: {
      padding: '16px 32px',
      fontSize: '16px',
      height: '48px'
    }
  };

  const styles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transform: 'translateY(0)'
  };

  const hoverStyles = !disabled ? {
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-md)'
    },
    ':active': {
      transform: 'translateY(0)'
    }
  } : {};

  // Merge styles for different states
  const mergedStyles = { ...styles };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      style={mergedStyles}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn ${className}`}
      {...props}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '8px'
        }}></div>
      )}
      {children}
      
      <style jsx>{`
        .btn:hover {
          ${!disabled && `
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          `}
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        .btn:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;