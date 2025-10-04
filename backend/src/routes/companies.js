import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'
import { withTransaction, softDeleteWithCompanyScope } from '../utils/transactions.js'
import { getAuditInfo } from '../utils/audit.js'
import { asyncHandler, ValidationError, handleDatabaseError } from '../utils/errorHandler.js'

const router = Router()

router.get('/', enforceCompanyScope, asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  
  let query, params
  if (req.scope.company_id) {
    // Regular user - only their company
    query = 'select * from companies where id = $1 and is_deleted = false order by created_at desc limit $2 offset $3'
    params = [req.scope.company_id, limit, offset]
  } else {
    // Super admin - all companies
    query = 'select * from companies where is_deleted = false order by created_at desc limit $1 offset $2'
    params = [limit, offset]
  }
  
  try {
    const { rows } = await pool.query(query, params)
    res.json({ items: rows, limit, offset })
  } catch (error) {
    handleDatabaseError(error, 'fetching companies')
  }
}))

router.post('/', asyncHandler(async (req, res) => {
  const {
    name,
    gstin,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country
  } = req.body || {}

  if (!name || String(name).trim().length === 0) {
    throw new ValidationError('Company name is required', 'name', name)
  }

  try {
    const { rows } = await pool.query(
      `insert into companies (name, gstin, address_line1, address_line2, city, state, postal_code, country)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning *`,
      [name, gstin || null, address_line1 || null, address_line2 || null, city || null, state || null, postal_code || null, country || 'IN']
    )
    res.status(201).json(rows[0])
  } catch (error) {
    handleDatabaseError(error, 'creating company')
  }
}))

router.get('/:id', enforceCompanyScope, async (req, res) => {
  const { rows } = await pool.query('select * from companies where id = $1 and id = $2 and is_deleted = false', [req.params.id, req.scope.company_id])
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.put('/:id', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const {
    name,
    gstin,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    budget_limit
  } = req.body || {}

  if (name !== undefined && String(name).trim().length === 0) {
    return res.status(400).json({ error: 'name_invalid' })
  }

  const { rows } = await pool.query(
    `update companies set
       name = coalesce($2, name),
       gstin = coalesce($3, gstin),
       address_line1 = coalesce($4, address_line1),
       address_line2 = coalesce($5, address_line2),
       city = coalesce($6, city),
       state = coalesce($7, state),
       postal_code = coalesce($8, postal_code),
       country = coalesce($9, country),
       budget_limit = coalesce($10, budget_limit),
       updated_at = now()
     where id = $1 and id = $11
     returning *`,
    [id, name ?? null, gstin ?? null, address_line1 ?? null, address_line2 ?? null, city ?? null, state ?? null, postal_code ?? null, country ?? null, budget_limit ?? null, req.scope.company_id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.delete('/:id', enforceCompanyScope, async (req, res) => {
  const auditInfo = getAuditInfo(req)
  
  try {
    const result = await withTransaction(async (client) => {
      return await softDeleteWithCompanyScope(client, 'companies', req.params.id, req.scope.company_id, auditInfo)
    })
    
    if (!result) return res.status(404).json({ error: 'not_found' })
    res.status(204).send()
  } catch (error) {
    console.error('Error soft deleting company:', error)
    res.status(500).json({ error: 'Failed to delete company' })
  }
})

export default router


