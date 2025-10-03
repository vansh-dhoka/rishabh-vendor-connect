import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'

const router = Router()

router.get('/', enforceCompanyScope, async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  const { rows } = await pool.query(
    'select * from items where company_id = $1 order by created_at desc limit $2 offset $3',
    [req.scope.company_id, limit, offset]
  )
  res.json({ items: rows, limit, offset })
})

router.post('/', enforceCompanyScope, async (req, res) => {
  const { name, description, unit, hsn_sac_code, gst_rate, base_price } = req.body || {}
  if (!name || String(name).trim().length === 0) return res.status(400).json({ error: 'name_required' })
  try {
    const { rows } = await pool.query(
      `insert into items (company_id, name, description, unit, hsn_sac_code, gst_rate, base_price)
       values ($1,$2,$3, coalesce($4,'unit'), $5, coalesce($6,0.00), coalesce($7,0.00))
       returning *`,
      [req.scope.company_id, name, description || null, unit || null, hsn_sac_code || null, gst_rate ?? null, base_price ?? null]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_company_id' })
    throw e
  }
})

router.get('/:id', enforceCompanyScope, async (req, res) => {
  const { rows } = await pool.query('select * from items where id = $1 and company_id = $2', [req.params.id, req.scope.company_id])
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.put('/:id', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const { name, description, unit, hsn_sac_code, gst_rate, base_price } = req.body || {}
  if (name !== undefined && String(name).trim().length === 0) return res.status(400).json({ error: 'name_invalid' })
  const { rows } = await pool.query(
    `update items set
       name = coalesce($2, name),
       description = coalesce($3, description),
       unit = coalesce($4, unit),
       hsn_sac_code = coalesce($5, hsn_sac_code),
       gst_rate = coalesce($6, gst_rate),
       base_price = coalesce($7, base_price),
       updated_at = now()
     where id = $1 and company_id = $8
     returning *`,
    [id, name ?? null, description ?? null, unit ?? null, hsn_sac_code ?? null, gst_rate ?? null, base_price ?? null, req.scope.company_id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.delete('/:id', enforceCompanyScope, async (req, res) => {
  const { rowCount } = await pool.query('delete from items where id = $1 and company_id = $2', [req.params.id, req.scope.company_id])
  if (rowCount === 0) return res.status(404).json({ error: 'not_found' })
  res.status(204).send()
})

export default router


