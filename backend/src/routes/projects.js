import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'

const router = Router()

router.get('/', enforceCompanyScope, async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  const { rows } = await pool.query(
    'select * from projects where company_id = $1 order by created_at desc limit $2 offset $3',
    [req.scope.company_id, limit, offset]
  )
  res.json({ items: rows, limit, offset })
})

router.post('/', enforceCompanyScope, async (req, res) => {
  const { name, description, address_line1, address_line2, city, state, postal_code, status, budget_limit } = req.body || {}
  if (!name || String(name).trim().length === 0) return res.status(400).json({ error: 'name_required' })
  try {
    const { rows } = await pool.query(
      `insert into projects (company_id, name, description, address_line1, address_line2, city, state, postal_code, status, budget_limit)
       values ($1,$2,$3,$4,$5,$6,$7,$8, coalesce($9, 'planned'), coalesce($10, 0.00))
       returning *`,
      [req.scope.company_id, name, description || null, address_line1 || null, address_line2 || null, city || null, state || null, postal_code || null, status || null, budget_limit || null]
    )
    return res.status(201).json(rows[0])
  } catch (e) {
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_company_id' })
    throw e
  }
})

router.get('/:id', enforceCompanyScope, async (req, res) => {
  const { rows } = await pool.query('select * from projects where id = $1 and company_id = $2', [req.params.id, req.scope.company_id])
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.put('/:id', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const { name, description, address_line1, address_line2, city, state, postal_code, status, budget_limit } = req.body || {}
  if (name !== undefined && String(name).trim().length === 0) return res.status(400).json({ error: 'name_invalid' })
  if (status !== undefined && !['planned','active','on_hold','closed'].includes(status)) return res.status(400).json({ error: 'status_invalid' })
  const { rows } = await pool.query(
    `update projects set
       name = coalesce($2, name),
       description = coalesce($3, description),
       address_line1 = coalesce($4, address_line1),
       address_line2 = coalesce($5, address_line2),
       city = coalesce($6, city),
       state = coalesce($7, state),
       postal_code = coalesce($8, postal_code),
       status = coalesce($9, status),
       budget_limit = coalesce($10, budget_limit),
       updated_at = now()
     where id = $1 and company_id = $11
     returning *`,
    [id, name ?? null, description ?? null, address_line1 ?? null, address_line2 ?? null, city ?? null, state ?? null, postal_code ?? null, status ?? null, budget_limit ?? null, req.scope.company_id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.delete('/:id', enforceCompanyScope, async (req, res) => {
  const { rowCount } = await pool.query('delete from projects where id = $1 and company_id = $2', [req.params.id, req.scope.company_id])
  if (rowCount === 0) return res.status(404).json({ error: 'not_found' })
  res.status(204).send()
})

export default router


