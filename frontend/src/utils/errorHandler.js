/**
 * Frontend error handling utilities
 */

// Error types for frontend
export const ERROR_TYPES = {
  NETWORK: 'network_error',
  VALIDATION: 'validation_error',
  AUTHENTICATION: 'authentication_error',
  AUTHORIZATION: 'authorization_error',
  NOT_FOUND: 'not_found_error',
  SERVER: 'server_error',
  UNKNOWN: 'unknown_error'
}

/**
 * Enhanced error class for frontend
 */
export class FrontendError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, statusCode = null, details = null) {
    super(message)
    this.name = 'FrontendError'
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

/**
 * Parse API error response
 */
export function parseApiError(error) {
  // Network errors
  if (!error.response) {
    return new FrontendError(
      'Network error. Please check your internet connection.',
      ERROR_TYPES.NETWORK,
      null,
      { originalError: error.message }
    )
  }
  
  const { status, data } = error.response
  
  // Parse error response from backend
  if (data && typeof data === 'object') {
    const message = data.message || data.error || 'An error occurred'
    const type = data.type || ERROR_TYPES.SERVER
    const details = data.details || null
    
    return new FrontendError(message, type, status, details)
  }
  
  // Fallback error parsing
  let message = 'An error occurred'
  let type = ERROR_TYPES.SERVER
  
  switch (status) {
    case 400:
      message = 'Invalid request. Please check your input.'
      type = ERROR_TYPES.VALIDATION
      break
    case 401:
      message = 'Authentication required. Please log in.'
      type = ERROR_TYPES.AUTHENTICATION
      break
    case 403:
      message = 'You do not have permission to perform this action.'
      type = ERROR_TYPES.AUTHORIZATION
      break
    case 404:
      message = 'The requested resource was not found.'
      type = ERROR_TYPES.NOT_FOUND
      break
    case 500:
      message = 'Server error. Please try again later.'
      type = ERROR_TYPES.SERVER
      break
    default:
      message = `Error ${status}: ${data || 'Unknown error'}`
  }
  
  return new FrontendError(message, type, status, { originalError: error })
}

/**
 * User-friendly error messages
 */
export function getUserFriendlyMessage(error) {
  if (error instanceof FrontendError) {
    return error.message
  }
  
  if (error.type) {
    switch (error.type) {
      case ERROR_TYPES.NETWORK:
        return 'Connection problem. Please check your internet connection and try again.'
      case ERROR_TYPES.VALIDATION:
        return 'Please check your input and try again.'
      case ERROR_TYPES.AUTHENTICATION:
        return 'Please log in to continue.'
      case ERROR_TYPES.AUTHORIZATION:
        return 'You do not have permission to perform this action.'
      case ERROR_TYPES.NOT_FOUND:
        return 'The requested item was not found.'
      case ERROR_TYPES.SERVER:
        return 'Server error. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }
  
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Error logging utility
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    type: error.type || ERROR_TYPES.UNKNOWN,
    statusCode: error.statusCode,
    details: error.details,
    timestamp: error.timestamp || new Date().toISOString(),
    stack: error.stack,
    context
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Frontend Error:', errorInfo)
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
  
  return errorInfo
}

/**
 * Error boundary helper
 */
export function createErrorBoundary(Component, fallback = null) {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false, error: null }
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true, error }
    }
    
    componentDidCatch(error, errorInfo) {
      logError(error, { component: Component.name, errorInfo })
    }
    
    render() {
      if (this.state.hasError) {
        return fallback || (
          <div className="error-boundary">
            <div className="error-message">
              <h3>Something went wrong</h3>
              <p>We're sorry, but something unexpected happened.</p>
              <button onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          </div>
        )
      }
      
      return this.props.children
    }
  }
}

/**
 * API error handler wrapper
 */
export function withErrorHandling(apiFunction) {
  return async (...args) => {
    try {
      return await apiFunction(...args)
    } catch (error) {
      const frontendError = parseApiError(error)
      logError(frontendError, { apiFunction: apiFunction.name, args })
      throw frontendError
    }
  }
}

/**
 * Form validation error handler
 */
export function handleFormErrors(errors, setError) {
  if (errors.details && Array.isArray(errors.details)) {
    errors.details.forEach(detail => {
      if (detail.field) {
        setError(detail.field, { 
          type: 'server', 
          message: detail.message || 'Invalid value' 
        })
      }
    })
  } else {
    setError('root', { 
      type: 'server', 
      message: errors.message || 'Form validation failed' 
    })
  }
}

/**
 * Toast notification helper
 */
export function showErrorToast(error, toast) {
  const message = getUserFriendlyMessage(error)
  const type = error.type === ERROR_TYPES.AUTHENTICATION ? 'error' : 'error'
  
  toast({
    title: 'Error',
    description: message,
    status: type,
    duration: 5000,
    isClosable: true,
  })
}

/**
 * Retry mechanism for failed requests
 */
export async function retryRequest(requestFn, maxRetries = 3, delay = 1000) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      // Don't retry authentication or authorization errors
      if (error.type === ERROR_TYPES.AUTHENTICATION || 
          error.type === ERROR_TYPES.AUTHORIZATION) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}
