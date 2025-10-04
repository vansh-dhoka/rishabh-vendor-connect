import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

// Enhanced database configuration with fallback
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/rishabh_vendor_connect'

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Enhanced connection settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  // Retry configuration
  retryDelayMs: 1000,
  maxRetries: 3
})

// Enhanced error handling for database connections
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

pool.on('connect', () => {
  console.log('✅ Database client connected')
})

pool.on('remove', () => {
  console.log('📤 Database client removed from pool')
})

export async function verifyDatabaseConnection() {
  let client
  try {
    console.log('🔍 Verifying database connection...')
    client = await pool.connect()
    const result = await client.query('SELECT 1 as ok, NOW() as timestamp')
    console.log('✅ Database connection verified:', result.rows[0])
    return result.rows[0]?.ok === 1
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Database URL:', databaseUrl.replace(/\/\/.*@/, '//***:***@')) // Hide credentials
    return false
  } finally {
    if (client) {
      client.release()
    }
  }
}

// Enhanced database health check
export async function getDatabaseHealth() {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT 
          'connected' as status,
          NOW() as timestamp,
          (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections,
          (SELECT count(*) FROM pg_stat_activity) as active_connections
      `)
      return {
        status: 'healthy',
        ...result.rows[0],
        pool: {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        }
      }
    } finally {
      client.release()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}


