import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { verifyDatabaseConnection } from './db.js'
import vendorsRouter from './routes/vendors.js'
import companiesRouter from './routes/companies.js'
import itemsRouter from './routes/items.js'
import purchaseOrdersRouter from './routes/purchaseOrders.js'
import invoicesRouter from './routes/invoices.js'
import projectsRouter from './routes/projects.js'
import quotesRouter from './routes/quotes.js'
import posRouter from './routes/pos.js'
import filesRouter from './routes/files.js'
import authRouter from './routes/auth.js'
import { requireAuth } from './middleware/auth.js'
import propertiesRouter from './routes/properties.js'
import rfqsRouter from './routes/rfqs.js'
import monitoringRouter from './routes/monitoring.js'
import { rateLimit } from './middleware/validation.js'
import { getHealthStatus, logError, requestLogger, getDatabaseStats, getApplicationMetrics } from './utils/monitoring.js'

dotenv.config()

const app = express()

// Security middleware
if (process.env.NODE_ENV === 'production') {
  // Force HTTPS in production
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

// Rate limiting
app.use(rateLimit(60000, 100)) // 100 requests per minute

// Request logging
app.use(requestLogger)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '2mb' }))

app.use('/api/auth', authRouter)

app.use('/api/vendors', requireAuth, vendorsRouter)
app.use('/api/companies', requireAuth, companiesRouter)
app.use('/api/items', requireAuth, itemsRouter)
app.use('/api/purchase-orders', requireAuth, purchaseOrdersRouter)
app.use('/api/invoices', requireAuth, invoicesRouter)
app.use('/api/projects', requireAuth, projectsRouter)
app.use('/api/quotes', requireAuth, quotesRouter)
app.use('/api/pos', requireAuth, posRouter)
app.use('/api/files', requireAuth, filesRouter)
app.use('/api/properties', requireAuth, propertiesRouter)
app.use('/api/rfqs', requireAuth, rfqsRouter)
app.use('/api/monitoring', requireAuth, monitoringRouter)

// Simple health check endpoint (for Render health checks)
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Enhanced health check endpoint with database status
app.get('/health/detailed', async (_req, res) => {
  try {
    const health = await getHealthStatus()
    const statusCode = health.status === 'ok' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    logError(error, { endpoint: '/health/detailed' })
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

// Database stats endpoint
app.get('/api/stats/database', requireAuth, async (_req, res) => {
  try {
    const stats = await getDatabaseStats()
    res.json(stats)
  } catch (error) {
    logError(error, { endpoint: '/api/stats/database' })
    res.status(500).json({ error: 'Failed to get database stats' })
  }
})

// Application metrics endpoint
app.get('/api/stats/metrics', requireAuth, async (_req, res) => {
  try {
    const metrics = getApplicationMetrics()
    res.json(metrics)
  } catch (error) {
    logError(error, { endpoint: '/api/stats/metrics' })
    res.status(500).json({ error: 'Failed to get application metrics' })
  }
})

// Database seeding endpoint (for development/testing)
app.post('/api/admin/seed', requireAuth, async (req, res) => {
  try {
    // Only allow super admin to seed database
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { pool } = await import('./db.js')
    
    // Read and execute seed file
    const fs = await import('fs')
    const path = await import('path')
    const seedFile = path.join(process.cwd(), 'db', 'seed.sql')
    
    if (!fs.existsSync(seedFile)) {
      return res.status(404).json({ error: 'Seed file not found' })
    }
    
    const seedSQL = fs.readFileSync(seedFile, 'utf8')
    await pool.query(seedSQL)
    
    res.json({ message: 'Database seeded successfully' })
  } catch (error) {
    logError(error, { endpoint: '/api/admin/seed' })
    res.status(500).json({ error: 'Failed to seed database' })
  }
})

// Global error handler
app.use((error, req, res, next) => {
  logError(error, { 
    method: req.method, 
    url: req.url, 
    body: req.body,
    user: req.user?.id 
  })
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Rishabh Vendor Connect API started successfully!`)
  console.log(`📡 API listening on port ${port}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`❤️  Health check: http://localhost:${port}/health`)
  console.log(`📊 Detailed health: http://localhost:${port}/health/detailed`)
  console.log(`🔗 Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`)
})

export default app


