import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const databaseUrl = process.env.DATABASE_URL

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function verifyDatabaseConnection() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT 1 as ok')
    return result.rows[0]?.ok === 1
  } finally {
    client.release()
  }
}


