import { logError } from './monitoring.js'

/**
 * Enhanced error handling utilities
 */

// Error types for better categorization
export const ERROR_TYPES = {
  VALIDATION: 'validation_error',
  AUTHENTICATION: 'authentication_error',
  AUTHORIZATION: 'authorization_error',
  DATABASE: 'database_error',
  NETWORK: 'network_error',
  FILE_UPLOAD: 'file_upload_error',
  BUSINESS_LOGIC: 'business_logic_error',
  EXTERNAL_API: 'external_api_error',
  UNKNOWN: 'unknown_error'
}

// HTTP status codes mapping
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
}

/**
 * Custom error class with enhanced properties
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
    this.isOperational = true
    
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message, field = null, value = null) {
    super(message, ERROR_TYPES.VALIDATION, HTTP_STATUS.BAD_REQUEST, { field, value })
    this.name = 'ValidationError'
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, ERROR_TYPES.AUTHENTICATION, HTTP_STATUS.UNAUTHORIZED)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, ERROR_TYPES.AUTHORIZATION, HTTP_STATUS.FORBIDDEN)
    this.name = 'AuthorizationError'
  }
}

/**
 * Database error class
 */
export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, ERROR_TYPES.DATABASE, HTTP_STATUS.INTERNAL_SERVER_ERROR, { originalError: originalError?.message })
    this.name = 'DatabaseError'
  }
}

/**
 * Business logic error class
 */
export class BusinessLogicError extends AppError {
  constructor(message, details = null) {
    super(message, ERROR_TYPES.BUSINESS_LOGIC, HTTP_STATUS.UNPROCESSABLE_ENTITY, details)
    this.name = 'BusinessLogicError'
  }
}

/**
 * Enhanced error response formatter
 */
export function formatErrorResponse(error, req = null) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Base error response
  const response = {
    error: true,
    message: error.message || 'An unexpected error occurred',
    type: error.type || ERROR_TYPES.UNKNOWN,
    timestamp: error.timestamp || new Date().toISOString(),
    statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  }
  
  // Add request context if available
  if (req) {
    response.request = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || null
    }
  }
  
  // Add details in development or for operational errors
  if (isDevelopment || error.isOperational) {
    if (error.details) {
      response.details = error.details
    }
    if (error.stack && isDevelopment) {
      response.stack = error.stack
    }
  }
  
  // Add error ID for tracking
  response.errorId = generateErrorId()
  
  return response
}

/**
 * Generate unique error ID for tracking
 */
function generateErrorId() {
  return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Enhanced error handler middleware
 */
export function errorHandler(error, req, res, next) {
  // Log the error with context
  logError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    errorId: error.errorId
  })
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatErrorResponse(error, req))
  }
  
  if (error.name === 'AuthenticationError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(formatErrorResponse(error, req))
  }
  
  if (error.name === 'AuthorizationError') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(formatErrorResponse(error, req))
  }
  
  if (error.name === 'DatabaseError') {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatErrorResponse(error, req))
  }
  
  if (error.name === 'BusinessLogicError') {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(formatErrorResponse(error, req))
  }
  
  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const authError = new AuthenticationError('Invalid token')
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(formatErrorResponse(authError, req))
  }
  
  if (error.name === 'TokenExpiredError') {
    const authError = new AuthenticationError('Token expired')
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(formatErrorResponse(authError, req))
  }
  
  // Handle database constraint errors
  if (error.code === '23505') { // Unique constraint violation
    const validationError = new ValidationError('Duplicate entry. This record already exists.')
    return res.status(HTTP_STATUS.CONFLICT).json(formatErrorResponse(validationError, req))
  }
  
  if (error.code === '23503') { // Foreign key constraint violation
    const validationError = new ValidationError('Referenced record does not exist.')
    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatErrorResponse(validationError, req))
  }
  
  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    const fileError = new AppError('File too large', ERROR_TYPES.FILE_UPLOAD, HTTP_STATUS.BAD_REQUEST)
    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatErrorResponse(fileError, req))
  }
  
  // Default error handling
  const appError = new AppError(
    error.message || 'Internal server error',
    ERROR_TYPES.UNKNOWN,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  )
  
  res.status(appError.statusCode).json(formatErrorResponse(appError, req))
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validation helper
 */
export function validateRequired(fields, data) {
  const missing = []
  
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field)
    }
  }
  
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`, missing)
  }
}

/**
 * Database error handler
 */
export function handleDatabaseError(error, operation = 'database operation') {
  console.error(`Database error during ${operation}:`, error)
  
  if (error.code) {
    switch (error.code) {
      case '23505':
        throw new ValidationError('Duplicate entry. This record already exists.')
      case '23503':
        throw new ValidationError('Referenced record does not exist.')
      case '23502':
        throw new ValidationError('Required field is missing.')
      case '42P01':
        throw new DatabaseError('Database table not found.')
      case 'ECONNREFUSED':
        throw new DatabaseError('Database connection refused.')
      case 'ENOTFOUND':
        throw new DatabaseError('Database host not found.')
      default:
        throw new DatabaseError(`Database error: ${error.message}`, error)
    }
  }
  
  throw new DatabaseError(`Database error during ${operation}: ${error.message}`, error)
}
