import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'

const router = Router()

router.get('/', enforceCompanyScope, async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  const { rows } = await pool.query(
    'select * from vendors where company_id = $1 order by created_at desc limit $2 offset $3',
    [req.scope.company_id, limit, offset]
  )
  res.json({ items: rows, limit, offset })
})

router.post('/', enforceCompanyScope, async (req, res) => {
  const { name, gstin, pan, bank_name, bank_account, ifsc_code, email, phone, address_line1, address_line2, city, state, postal_code, country } = req.body || {}
  if (!name || String(name).trim().length === 0) return res.status(400).json({ error: 'name_required' })
  try {
    const { rows } = await pool.query(
      `insert into vendors (company_id, name, gstin, pan, bank_name, bank_account_number, ifsc_code, email, phone, address_line1, address_line2, city, state, postal_code, country)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, coalesce($15, 'IN'))
       returning *`,
      [req.scope.company_id, name, gstin || null, pan || null, bank_name || null, bank_account || null, ifsc_code || null, email || null, phone || null, address_line1 || null, address_line2 || null, city || null, state || null, postal_code || null, country || null]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_company_id' })
    throw e
  }
})

router.get('/:id', enforceCompanyScope, async (req, res) => {
  const { rows } = await pool.query('select * from vendors where id = $1 and company_id = $2', [req.params.id, req.scope.company_id])
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.put('/:id', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const { name, gstin, pan, bank_name, bank_account, ifsc_code, email, phone, address_line1, address_line2, city, state, postal_code, country } = req.body || {}
  if (name !== undefined && String(name).trim().length === 0) return res.status(400).json({ error: 'name_invalid' })
  const { rows } = await pool.query(
    `update vendors set
       name = coalesce($2, name),
       gstin = coalesce($3, gstin),
       pan = coalesce($4, pan),
       bank_name = coalesce($5, bank_name),
       bank_account_number = coalesce($6, bank_account_number),
       ifsc_code = coalesce($7, ifsc_code),
       email = coalesce($8, email),
       phone = coalesce($9, phone),
       address_line1 = coalesce($10, address_line1),
       address_line2 = coalesce($11, address_line2),
       city = coalesce($12, city),
       state = coalesce($13, state),
       postal_code = coalesce($14, postal_code),
       country = coalesce($15, country),
       updated_at = now()
     where id = $1 and company_id = $16
     returning *`,
    [id, name ?? null, gstin ?? null, pan ?? null, bank_name ?? null, bank_account ?? null, ifsc_code ?? null, email ?? null, phone ?? null, address_line1 ?? null, address_line2 ?? null, city ?? null, state ?? null, postal_code ?? null, country ?? null, req.scope.company_id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

router.delete('/:id', enforceCompanyScope, async (req, res) => {
  const { rowCount } = await pool.query('delete from vendors where id = $1 and company_id = $2', [req.params.id, req.scope.company_id])
  if (rowCount === 0) return res.status(404).json({ error: 'not_found' })
  res.status(204).send()
})

export default router


