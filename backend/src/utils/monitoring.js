import { pool } from '../db.js'

// Health check with detailed status
export async function getHealthStatus() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {}
  }
  
  try {
    // Database health check
    const dbStart = Date.now()
    const dbResult = await pool.query('SELECT 1 as ok, version() as version')
    const dbLatency = Date.now() - dbStart
    
    health.services.database = {
      status: 'ok',
      latency: `${dbLatency}ms`,
      version: dbResult.rows[0]?.version || 'unknown'
    }
  } catch (error) {
    health.status = 'error'
    health.services.database = {
      status: 'error',
      error: error.message
    }
  }
  
  // Memory usage
  const memUsage = process.memoryUsage()
  health.services.memory = {
    status: 'ok',
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  }
  
  // Uptime
  health.services.uptime = {
    status: 'ok',
    uptime: `${Math.round(process.uptime())}s`
  }
  
  return health
}

// Error tracking and logging
export function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
    environment: process.env.NODE_ENV || 'development'
  }
  
  console.error('Application Error:', JSON.stringify(errorLog, null, 2))
  
  // In production, you might want to send this to an external service
  // like Sentry, LogRocket, or DataDog
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to external monitoring service
    // sendToMonitoringService(errorLog)
  }
}

// Performance monitoring
export function logPerformance(operation, duration, metadata = {}) {
  const perfLog = {
    timestamp: new Date().toISOString(),
    operation,
    duration: `${duration}ms`,
    metadata,
    environment: process.env.NODE_ENV || 'development'
  }
  
  // Log slow operations (>1 second)
  if (duration > 1000) {
    console.warn('Slow Operation:', JSON.stringify(perfLog, null, 2))
  } else {
    console.log('Performance:', JSON.stringify(perfLog, null, 2))
  }
}

// Database connection monitoring
export async function getDatabaseStats() {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT count(*) FROM pg_stat_activity) as total_connections
    `)
    
    return {
      status: 'ok',
      connections: stats.rows[0]
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    }
  }
}

// Application metrics
export function getApplicationMetrics() {
  return {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  }
}

// Middleware for request logging
export function requestLogger(req, res, next) {
  const start = Date.now()
  const originalSend = res.send
  
  res.send = function(data) {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection?.remoteAddress,
      timestamp: new Date().toISOString()
    }
    
    // Log slow requests (>2 seconds)
    if (duration > 2000) {
      console.warn('Slow Request:', JSON.stringify(logData, null, 2))
    } else {
      console.log('Request:', JSON.stringify(logData, null, 2))
    }
    
    originalSend.call(this, data)
  }
  
  next()
}
