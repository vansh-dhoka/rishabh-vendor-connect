import React from 'react'
import { logError } from '../utils/errorHandler.js'

/**
 * Error Boundary component for catching React errors
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, { 
      component: this.props.componentName || 'ErrorBoundary', 
      errorInfo 
    })
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary" style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          margin: '1rem'
        }}>
          <div className="error-message">
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
              Something went wrong
            </h3>
            <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>
              We're sorry, but something unexpected happened.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary(WrappedComponent, fallback = null) {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary 
        componentName={WrappedComponent.name}
        fallback={fallback}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
