import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { verifyDatabaseConnection, getDatabaseHealth } from './db.js'
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
import { errorHandler, asyncHandler } from './utils/errorHandler.js'

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
    const [health, dbHealth] = await Promise.all([
      getHealthStatus(),
      getDatabaseHealth()
    ])
    
    const overallStatus = health.status === 'ok' && dbHealth.status === 'healthy' ? 'ok' : 'error'
    const statusCode = overallStatus === 'ok' ? 200 : 503
    
    res.status(statusCode).json({
      ...health,
      database: dbHealth,
      overall: overallStatus
    })
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

// Create sample data endpoint
app.post('/api/admin/create-sample-data', requireAuth, async (req, res) => {
  try {
    // Only allow super admin to create sample data
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { pool } = await import('./db.js')
    
    // Get the first company ID
    const companyResult = await pool.query('SELECT id FROM companies LIMIT 1')
    if (companyResult.rows.length === 0) {
      return res.status(400).json({ error: 'No companies found. Create a company first.' })
    }
    
    const companyId = companyResult.rows[0].id
    console.log('Using company ID:', companyId)
    
    // Create a project
    const projectResult = await pool.query(`
      INSERT INTO projects (id, company_id, name, description, address_line1, city, state, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440001',
      companyId,
      'Luxury Apartments Phase 1',
      'High-end residential project',
      '456 Construction Site',
      'Mumbai',
      'Maharashtra',
      'active'
    ])
    
    const projectId = projectResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440001'
    
    // Create vendors
    const vendorResult = await pool.query(`
      INSERT INTO vendors (id, company_id, name, gstin, email, phone, address_line1, city, state) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440002',
      companyId,
      'ABC Construction Ltd',
      '27ABCDE1234F1Z5',
      'contact@abcconstruction.com',
      '+91-9876543210',
      '789 Industrial Area',
      'Pune',
      'Maharashtra'
    ])
    
    const vendorId = vendorResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440002'
    
    // Create items
    await pool.query(`
      INSERT INTO items (id, company_id, name, description, unit, hsn_sac_code, gst_rate, base_price) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (id) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440004',
      companyId,
      'Cement',
      'Portland Cement Grade 53',
      'bags',
      '25232930',
      28.00,
      350.00
    ])
    
    // Create RFQ
    const rfqResult = await pool.query(`
      INSERT INTO quotation_requests (id, company_id, project_id, title, description, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440007',
      companyId,
      projectId,
      'Construction Materials RFQ',
      'Request for construction materials for Phase 1',
      'sent'
    ])
    
    const rfqId = rfqResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440007'
    
    // Create RFQ items
    await pool.query(`
      INSERT INTO quotation_items (id, rfq_id, item_id, description, quantity, target_rate, hsn_sac_code, gst_rate) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (id) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440008',
      rfqId,
      '550e8400-e29b-41d4-a716-446655440004',
      'Cement bags',
      1000,
      350.00,
      '25232930',
      28.00
    ])
    
    // Create vendor quote
    const quoteResult = await pool.query(`
      INSERT INTO vendor_quotes (id, rfq_id, vendor_id, status, total) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440010',
      rfqId,
      vendorId,
      'submitted',
      448000.00
    ])
    
    const quoteId = quoteResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440010'
    
    // Create PO
    const poResult = await pool.query(`
      INSERT INTO purchase_orders (id, company_id, project_id, vendor_id, rfq_id, po_number, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440013',
      companyId,
      projectId,
      vendorId,
      rfqId,
      'PO-20241201000001',
      'issued',
      'INR',
      660000.00,
      0.00,
      0.00,
      118800.00,
      778800.00
    ])
    
    const poId = poResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440013'
    
    // Create invoice
    await pool.query(`
      INSERT INTO invoices (id, company_id, vendor_id, po_id, invoice_number, invoice_date, due_date, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      ON CONFLICT (id) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440016',
      companyId,
      vendorId,
      poId,
      'INV-2024-001',
      '2024-12-01',
      '2024-12-31',
      'submitted',
      'INR',
      660000.00,
      0.00,
      0.00,
      118800.00,
      778800.00
    ])
    
    res.json({ 
      message: 'Sample data created successfully!',
      data: {
        companyId,
        projectId,
        vendorId,
        rfqId,
        poId
      }
    })
  } catch (error) {
    logError(error, { endpoint: '/api/admin/create-sample-data' })
    res.status(500).json({ error: 'Failed to create sample data', details: error.message })
  }
})

// Global error handler
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const port = process.env.PORT || 4000

// Start server with database verification
async function startServer() {
  try {
    // Verify database connection before starting server
    console.log('🔍 Verifying database connection...')
    const dbConnected = await verifyDatabaseConnection()
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will start but some features may not work.')
      console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is correct')
    } else {
      console.log('✅ Database connection verified successfully!')
    }
    
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Rishabh Vendor Connect API started successfully!`)
      console.log(`📡 API listening on port ${port}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`❤️  Health check: http://localhost:${port}/health`)
      console.log(`📊 Detailed health: http://localhost:${port}/health/detailed`)
      console.log(`🔗 Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`)
      console.log(`🗄️  Database status: ${dbConnected ? 'Connected' : 'Disconnected'}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()

export default app


