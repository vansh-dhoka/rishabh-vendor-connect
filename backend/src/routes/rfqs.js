import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'

const router = Router()

// List RFQs
router.get('/', enforceCompanyScope, async (req, res) => {
  const companyId = req.query.company_id || null
  const projectId = req.query.project_id || null
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  let rows
  if (projectId) {
    ({ rows } = await pool.query(
      'select * from quotation_requests where project_id = $1 order by created_at desc limit $2 offset $3',
      [projectId, limit, offset]
    ))
  } else if (companyId) {
    ({ rows } = await pool.query(
      'select * from quotation_requests where company_id = $1 order by created_at desc limit $2 offset $3',
      [companyId, limit, offset]
    ))
  } else {
    ({ rows } = await pool.query('select * from quotation_requests order by created_at desc limit $1 offset $2', [limit, offset]))
  }
  res.json({ items: rows, limit, offset })
})

// Create RFQ with items
router.post('/', enforceCompanyScope, async (req, res) => {
  const client = await pool.connect()
  try {
    const { company_id, project_id, title, description, due_date, items } = req.body || {}
    if (!company_id) return res.status(400).json({ error: 'company_id_required' })
    if (!title || String(title).trim().length === 0) return res.status(400).json({ error: 'title_required' })
    await client.query('begin')
    const rfqResult = await client.query(
      `insert into quotation_requests (company_id, project_id, title, description, due_date, status)
       values ($1,$2,$3,$4,$5,'sent') returning *`,
      [company_id, project_id || null, title, description || null, due_date || null]
    )
    const rfq = rfqResult.rows[0]
    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        await client.query(
          `insert into quotation_items (rfq_id, item_id, description, quantity, target_rate, hsn_sac_code, gst_rate)
           values ($1,$2,$3, coalesce($4,1), $5, $6, coalesce($7,0.00))`,
          [rfq.id, it.item_id || null, it.description || null, it.quantity ?? null, it.target_rate ?? null, it.hsn_sac_code || null, it.gst_rate ?? null]
        )
      }
    }
    await client.query('commit')
    res.status(201).json(rfq)
  } catch (e) {
    await (client.query('rollback').catch(() => {}))
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_fk' })
    throw e
  } finally {
    client.release()
  }
})

// Get RFQ details with items
router.get('/:id', enforceCompanyScope, async (req, res) => {
  const rfqId = req.params.id
  const rfq = await pool.query('select * from quotation_requests where id = $1', [rfqId])
  if (rfq.rows.length === 0) return res.status(404).json({ error: 'not_found' })
  const items = await pool.query('select * from quotation_items where rfq_id = $1', [rfqId])
  res.json({ ...rfq.rows[0], items: items.rows })
})

// Vendor submits quote (header + items)
router.post('/:id/vendor-quotes', enforceCompanyScope, async (req, res) => {
  const rfqId = req.params.id
  const { vendor_id, items } = req.body || {}
  if (!vendor_id) return res.status(400).json({ error: 'vendor_id_required' })
  const client = await pool.connect()
  try {
    await client.query('begin')
    const vq = await client.query(
      `insert into vendor_quotes (rfq_id, vendor_id, status, total) values ($1,$2,'submitted',0.00) returning *`,
      [rfqId, vendor_id]
    )
    let total = 0
    if (Array.isArray(items)) {
      for (const it of items) {
        const qty = Number(it.quantity || 1)
        const rate = Number(it.unit_rate || 0)
        const lineTotal = qty * rate
        total += lineTotal
        await client.query(
          `insert into vendor_quote_items (vendor_quote_id, rfq_item_id, description, quantity, unit_rate, hsn_sac_code, gst_rate, line_total)
           values ($1,$2,$3, coalesce($4,1), coalesce($5,0.00), $6, coalesce($7,0.00), $8)`,
          [vq.rows[0].id, it.rfq_item_id || null, it.description || null, it.quantity ?? null, it.unit_rate ?? null, it.hsn_sac_code || null, it.gst_rate ?? null, lineTotal]
        )
      }
    }
    const updated = await client.query('update vendor_quotes set total = $2, updated_at = now() where id = $1 returning *', [vq.rows[0].id, total])
    await client.query('commit')
    res.status(201).json(updated.rows[0])
  } catch (e) {
    await (client.query('rollback').catch(() => {}))
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_fk' })
    throw e
  } finally {
    client.release()
  }
})

// List vendor quotes for an RFQ (with totals)
router.get('/:id/vendor-quotes', async (req, res) => {
  const rfqId = req.params.id
  const vq = await pool.query('select * from vendor_quotes where rfq_id = $1 order by created_at desc', [rfqId])
  res.json({ items: vq.rows })
})

// Negotiation logs (create & list)
router.get('/:id/negotiations', enforceCompanyScope, async (req, res) => {
  const rfqId = req.params.id
  const { rows } = await pool.query('select * from negotiation_logs where rfq_id = $1 order by created_at asc', [rfqId])
  res.json({ items: rows })
})

router.post('/:id/negotiations', enforceCompanyScope, async (req, res) => {
  const rfqId = req.params.id
  const { vendor_id, item_id, message, offered_rate, created_by } = req.body || {}
  const { rows } = await pool.query(
    `insert into negotiation_logs (rfq_id, vendor_id, item_id, message, offered_rate, created_by)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [rfqId, vendor_id || null, item_id || null, message || null, offered_rate ?? null, created_by || 'system']
  )
  res.status(201).json(rows[0])
})

// Approve a vendor quote -> create Purchase Order
router.post('/:id/approve', enforceCompanyScope, async (req, res) => {
  const rfqId = req.params.id
  const { vendor_quote_id } = req.body || {}
  if (!vendor_quote_id) return res.status(400).json({ error: 'vendor_quote_id_required' })
  const client = await pool.connect()
  try {
    await client.query('begin')
    const rfq = await client.query('select * from quotation_requests where id = $1', [rfqId])
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'rfq_not_found' })
    const vq = await client.query('select * from vendor_quotes where id = $1 and rfq_id = $2', [vendor_quote_id, rfqId])
    if (vq.rows.length === 0) return res.status(404).json({ error: 'quote_not_found' })
    const vendorId = vq.rows[0].vendor_id

    const po = await client.query(
      `insert into purchase_orders (company_id, project_id, vendor_id, rfq_id, po_number, status, subtotal, total)
       values ($1,$2,$3,$4, concat('PO-', to_char(now(),'YYYYMMDDHH24MISS')), 'issued', $5, $5)
       returning *`,
      [rfq.rows[0].company_id, rfq.rows[0].project_id, vendorId, rfqId, vq.rows[0].total]
    )
    const poId = po.rows[0].id

    const vqItems = await client.query('select * from vendor_quote_items where vendor_quote_id = $1', [vendor_quote_id])
    for (const it of vqItems.rows) {
      await client.query(
        `insert into po_items (po_id, item_id, description, hsn_sac_code, gst_rate, quantity, unit_rate, line_subtotal, tax_cgst, tax_sgst, tax_igst, line_total)
         values ($1, null, $2, $3, coalesce($4,0.00), coalesce($5,1), coalesce($6,0.00), $7, 0.00, 0.00, 0.00, $7)`,
        [poId, it.description || null, it.hsn_sac_code || null, it.gst_rate ?? null, it.quantity ?? null, it.unit_rate ?? null, it.line_total]
      )
    }

    await client.query("update quotation_requests set status = 'closed', updated_at = now() where id = $1", [rfqId])
    await client.query('commit')
    res.status(201).json({ purchase_order: po.rows[0] })
  } catch (e) {
    await (client.query('rollback').catch(() => {}))
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_fk' })
    throw e
  } finally {
    client.release()
  }
})

export default router


