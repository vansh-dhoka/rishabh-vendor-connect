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

// Enhanced health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const health = await getHealthStatus()
    const statusCode = health.status === 'ok' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    logError(error, { endpoint: '/health' })
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
  console.log(`API listening on http://localhost:${port}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health check: http://localhost:${port}/health`)
})

export default app


