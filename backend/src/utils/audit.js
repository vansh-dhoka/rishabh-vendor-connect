import { pool } from '../db.js'

export async function logAuditEvent({
  tableName,
  recordId,
  action,
  oldValues = null,
  newValues = null,
  changedBy = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tableName, recordId, action, oldValues, newValues, changedBy, ipAddress, userAgent]
    )
  } catch (error) {
    console.error('Failed to log audit event:', error)
    // Don't throw - audit logging should not break the main operation
  }
}

export function getAuditInfo(req) {
  return {
    changedBy: req.user?.id || null,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.get('User-Agent') || null
  }
}

export async function getAuditHistory(tableName, recordId, limit = 50) {
  const { rows } = await pool.query(
    `SELECT * FROM audit_logs 
     WHERE table_name = $1 AND record_id = $2 
     ORDER BY changed_at DESC 
     LIMIT $3`,
    [tableName, recordId, limit]
  )
  return rows
}
