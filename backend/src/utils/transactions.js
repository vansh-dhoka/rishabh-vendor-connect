import { pool } from '../db.js'

export async function withTransaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function softDelete(client, tableName, id, auditInfo = {}) {
  const result = await client.query(
    `UPDATE ${tableName} SET is_deleted = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  )
  
  if (result.rows.length > 0) {
    // Log the soft delete
    await client.query(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, ip_address, user_agent)
       VALUES ($1, $2, 'SOFT_DELETE', $3, $4, $5, $6, $7)`,
      [
        tableName,
        id,
        JSON.stringify(result.rows[0]),
        JSON.stringify({ is_deleted: true, updated_at: new Date().toISOString() }),
        auditInfo.changedBy,
        auditInfo.ipAddress,
        auditInfo.userAgent
      ]
    )
  }
  
  return result.rows[0]
}

export async function softDeleteWithCompanyScope(client, tableName, id, companyId, auditInfo = {}) {
  const result = await client.query(
    `UPDATE ${tableName} SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND company_id = $2 RETURNING *`,
    [id, companyId]
  )
  
  if (result.rows.length > 0) {
    // Log the soft delete
    await client.query(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, ip_address, user_agent)
       VALUES ($1, $2, 'SOFT_DELETE', $3, $4, $5, $6, $7)`,
      [
        tableName,
        id,
        JSON.stringify(result.rows[0]),
        JSON.stringify({ is_deleted: true, updated_at: new Date().toISOString() }),
        auditInfo.changedBy,
        auditInfo.ipAddress,
        auditInfo.userAgent
      ]
    )
  }
  
  return result.rows[0]
}
