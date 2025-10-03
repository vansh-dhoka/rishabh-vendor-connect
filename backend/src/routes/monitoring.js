import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { getHealthStatus, getDatabaseStats, getApplicationMetrics, logError } from '../utils/monitoring.js'

const router = Router()

// System overview dashboard
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const [health, dbStats, metrics] = await Promise.all([
      getHealthStatus(),
      getDatabaseStats(),
      getApplicationMetrics()
    ])
    
    res.json({
      timestamp: new Date().toISOString(),
      health,
      database: dbStats,
      metrics,
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    logError(error, { endpoint: '/monitoring/overview' })
    res.status(500).json({ error: 'Failed to get system overview' })
  }
})

// Database performance metrics
router.get('/database', requireAuth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT count(*) FROM pg_stat_activity) as total_connections,
        (SELECT pg_database_size(current_database())) as database_size_bytes
    `)
    
    const tableStats = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC
      LIMIT 10
    `)
    
    res.json({
      timestamp: new Date().toISOString(),
      connectionStats: stats.rows[0],
      tableStats: tableStats.rows
    })
  } catch (error) {
    logError(error, { endpoint: '/monitoring/database' })
    res.status(500).json({ error: 'Failed to get database metrics' })
  }
})

// Application performance metrics
router.get('/performance', requireAuth, async (req, res) => {
  try {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    // Get recent audit log activity
    const recentActivity = await pool.query(`
      SELECT 
        table_name,
        action,
        COUNT(*) as count,
        MAX(changed_at) as last_activity
      FROM audit_logs 
      WHERE changed_at > NOW() - INTERVAL '1 hour'
      GROUP BY table_name, action
      ORDER BY count DESC
    `)
    
    res.json({
      timestamp: new Date().toISOString(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      recentActivity: recentActivity.rows
    })
  } catch (error) {
    logError(error, { endpoint: '/monitoring/performance' })
    res.status(500).json({ error: 'Failed to get performance metrics' })
  }
})

// Business metrics
router.get('/business', requireAuth, async (req, res) => {
  try {
    const companyId = req.scope?.company_id
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company scope required' })
    }
    
    const metrics = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM companies WHERE is_deleted = false) as total_companies,
        (SELECT COUNT(*) FROM projects WHERE company_id = $1 AND is_deleted = false) as total_projects,
        (SELECT COUNT(*) FROM vendors WHERE company_id = $1 AND is_deleted = false) as total_vendors,
        (SELECT COUNT(*) FROM purchase_orders WHERE company_id = $1 AND is_deleted = false) as total_pos,
        (SELECT COUNT(*) FROM invoices WHERE company_id = $1 AND is_deleted = false) as total_invoices,
        (SELECT COALESCE(SUM(total), 0) FROM purchase_orders WHERE company_id = $1 AND is_deleted = false AND status != 'cancelled') as total_po_value,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE company_id = $1 AND is_deleted = false AND status = 'paid') as total_paid_invoices
    `, [companyId])
    
    const recentActivity = await pool.query(`
      SELECT 
        'purchase_orders' as entity_type,
        COUNT(*) as count,
        MAX(created_at) as last_created
      FROM purchase_orders 
      WHERE company_id = $1 AND is_deleted = false AND created_at > NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'invoices' as entity_type,
        COUNT(*) as count,
        MAX(created_at) as last_created
      FROM invoices 
      WHERE company_id = $1 AND is_deleted = false AND created_at > NOW() - INTERVAL '7 days'
    `, [companyId])
    
    res.json({
      timestamp: new Date().toISOString(),
      companyId,
      metrics: metrics.rows[0],
      recentActivity: recentActivity.rows
    })
  } catch (error) {
    logError(error, { endpoint: '/monitoring/business' })
    res.status(500).json({ error: 'Failed to get business metrics' })
  }
})

// Error logs (last 24 hours)
router.get('/errors', requireAuth, async (req, res) => {
  try {
    const errors = await pool.query(`
      SELECT 
        id,
        table_name,
        action,
        changed_at,
        old_values,
        new_values,
        changed_by,
        ip_address
      FROM audit_logs 
      WHERE action = 'ERROR' 
        AND changed_at > NOW() - INTERVAL '24 hours'
      ORDER BY changed_at DESC
      LIMIT 100
    `)
    
    res.json({
      timestamp: new Date().toISOString(),
      errorCount: errors.rows.length,
      errors: errors.rows
    })
  } catch (error) {
    logError(error, { endpoint: '/monitoring/errors' })
    res.status(500).json({ error: 'Failed to get error logs' })
  }
})

export default router
