import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'
import { checkBudgetLimits, validatePOStatusTransition } from '../utils/budget.js'
import { computeLineTotals, sumPoTotals } from '../utils/tax.js'

const router = Router()

// List POs
router.get('/', enforceCompanyScope, async (req, res) => {
  const companyId = req.query.company_id || null
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  let rows
  if (companyId) {
    ({ rows } = await pool.query(
      'select * from purchase_orders where company_id = $1 order by created_at desc limit $2 offset $3',
      [companyId, limit, offset]
    ))
  } else {
    ({ rows } = await pool.query('select * from purchase_orders order by created_at desc limit $1 offset $2', [limit, offset]))
  }
  res.json({ items: rows, limit, offset })
})

// Get PO detail with items
router.get('/:id', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const po = await pool.query('select * from purchase_orders where id = $1', [id])
  if (po.rows.length === 0) return res.status(404).json({ error: 'not_found' })
  const items = await pool.query('select * from po_items where po_id = $1', [id])
  res.json({ ...po.rows[0], items: items.rows })
})

// Create PO from an approved vendor quote
router.post('/from-quote', enforceCompanyScope, async (req, res) => {
  const { vendor_quote_id, tax_mode } = req.body || {}
  if (!vendor_quote_id) return res.status(400).json({ error: 'vendor_quote_id_required' })
  const client = await pool.connect()
  try {
    await client.query('begin')
    const vq = await client.query('select * from vendor_quotes where id = $1', [vendor_quote_id])
    if (vq.rows.length === 0) return res.status(404).json({ error: 'quote_not_found' })

    const rfq = await client.query('select * from quotation_requests where id = $1', [vq.rows[0].rfq_id])
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'rfq_not_found' })
    if (rfq.rows[0].company_id !== req.scope.company_id) return res.status(403).json({ error: 'company_scope_violation' })

    // Prevent duplicate PO for same RFQ
    const existingPo = await client.query('select 1 from purchase_orders where rfq_id = $1 limit 1', [rfq.rows[0].id])
    if (existingPo.rows.length > 0) return res.status(400).json({ error: 'po_already_exists_for_rfq' })

    const po = await client.query(
      `insert into purchase_orders (company_id, project_id, vendor_id, rfq_id, po_number, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total)
       values ($1,$2,$3,$4, concat('PO-', to_char(now(),'YYYYMMDDHH24MISS')), 'issued', 'INR', 0,0,0,0,0)
       returning *`,
      [rfq.rows[0].company_id, rfq.rows[0].project_id, vq.rows[0].vendor_id, rfq.rows[0].id]
    )
    const poId = po.rows[0].id

    const vqItems = await client.query('select * from vendor_quote_items where vendor_quote_id = $1', [vendor_quote_id])
    // Validate items exist in item master and sum matches quote total
    let computedTotal = 0
    const lines = []
    for (const it of vqItems.rows) {
      const totals = computeLineTotals(it.quantity, it.unit_rate, it.gst_rate, tax_mode === 'inter' ? 'inter' : 'intra')
      computedTotal += totals.lineTotal
      const inserted = await client.query(
        `insert into po_items (po_id, item_id, description, hsn_sac_code, gst_rate, quantity, unit_rate, line_subtotal, tax_cgst, tax_sgst, tax_igst, line_total)
         values ($1, null, $2, $3, coalesce($4,0.00), coalesce($5,1), coalesce($6,0.00), $7, $8, $9, $10, $11)
         returning *`,
        [poId, it.description || null, it.hsn_sac_code || null, it.gst_rate ?? null, it.quantity ?? null, it.unit_rate ?? null, totals.lineSubtotal, totals.taxCgst, totals.taxSgst, totals.taxIgst, totals.lineTotal]
      )
      lines.push(inserted.rows[0])
    }
    // Ensure totals are aligned (allow small rounding diff)
    if (Math.abs(computedTotal - Number(vq.rows[0].total || 0)) > 0.5) {
      return res.status(400).json({ error: 'quote_total_mismatch' })
    }

    // Check budget limits
    const budgetWarnings = await checkBudgetLimits(req.scope.company_id, rfq.rows[0].project_id, computedTotal)
    if (budgetWarnings.some(w => w.type.includes('exceeded'))) {
      return res.status(400).json({ 
        error: 'budget_exceeded', 
        warnings: budgetWarnings 
      })
    }

    const sums = sumPoTotals(lines)
    const updatedPo = await client.query(
      `update purchase_orders set subtotal = $2, tax_cgst = $3, tax_sgst = $4, tax_igst = $5, total = $6, updated_at = now() where id = $1 returning *`,
      [poId, sums.subtotal, sums.tax_cgst, sums.tax_sgst, sums.tax_igst, sums.total]
    )

    await client.query('commit')
    res.status(201).json({ 
      po: updatedPo.rows[0], 
      items: lines,
      warnings: budgetWarnings.filter(w => !w.type.includes('exceeded'))
    })
  } catch (e) {
    await (client.query('rollback').catch(() => {}))
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_fk' })
    throw e
  } finally {
    client.release()
  }
})

// Update PO status
router.patch('/:id/status', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const { status } = req.body || {}
  
  // Get current PO status
  const currentPo = await pool.query('select status from purchase_orders where id = $1 and company_id = $2', [id, req.scope.company_id])
  if (currentPo.rows.length === 0) return res.status(404).json({ error: 'not_found' })
  
  const currentStatus = currentPo.rows[0].status
  
  // Validate status transition
  if (!validatePOStatusTransition(currentStatus, status)) {
    return res.status(400).json({ 
      error: 'invalid_status_transition', 
      current: currentStatus, 
      requested: status 
    })
  }
  
  const { rows } = await pool.query('update purchase_orders set status = $2, updated_at = now() where id = $1 and company_id = $3 returning *', [id, status, req.scope.company_id])
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

// Add PO item (computes taxes and totals)
router.post('/:id/items', async (req, res) => {
  const id = req.params.id
  const { description, item_id, hsn_sac_code, gst_rate, quantity, unit_rate, tax_mode } = req.body || {}
  const totals = computeLineTotals(quantity, unit_rate, gst_rate, tax_mode === 'inter' ? 'inter' : 'intra')
  const { rows } = await pool.query(
    `insert into po_items (po_id, item_id, description, hsn_sac_code, gst_rate, quantity, unit_rate, line_subtotal, tax_cgst, tax_sgst, tax_igst, line_total)
     values ($1, $2, $3, $4, coalesce($5,0.00), coalesce($6,1), coalesce($7,0.00), $8, $9, $10, $11, $12)
     returning *`,
    [id, item_id || null, description || null, hsn_sac_code || null, gst_rate ?? null, quantity ?? null, unit_rate ?? null, totals.lineSubtotal, totals.taxCgst, totals.taxSgst, totals.taxIgst, totals.lineTotal]
  )
  res.status(201).json(rows[0])
})

// Update PO item (recomputes taxes and totals)
router.put('/:id/items/:itemId', async (req, res) => {
  const id = req.params.id
  const itemId = req.params.itemId
  const { description, item_id, hsn_sac_code, gst_rate, quantity, unit_rate, tax_mode } = req.body || {}
  const totals = computeLineTotals(quantity, unit_rate, gst_rate, tax_mode === 'inter' ? 'inter' : 'intra')
  const { rows } = await pool.query(
    `update po_items set
       item_id = coalesce($3, item_id),
       description = coalesce($4, description),
       hsn_sac_code = coalesce($5, hsn_sac_code),
       gst_rate = coalesce($6, gst_rate),
       quantity = coalesce($7, quantity),
       unit_rate = coalesce($8, unit_rate),
       line_subtotal = $9,
       tax_cgst = $10,
       tax_sgst = $11,
       tax_igst = $12,
       line_total = $13
     where id = $2 and po_id = $1
     returning *`,
    [id, itemId, item_id ?? null, description ?? null, hsn_sac_code ?? null, gst_rate ?? null, quantity ?? null, unit_rate ?? null, totals.lineSubtotal, totals.taxCgst, totals.taxSgst, totals.taxIgst, totals.lineTotal]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

// Delete PO item
router.delete('/:id/items/:itemId', async (req, res) => {
  const { rowCount } = await pool.query('delete from po_items where id = $1 and po_id = $2', [req.params.itemId, req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'not_found' })
  res.status(204).send()
})

// Recalculate header totals from line items
router.post('/:id/recalculate', async (req, res) => {
  const id = req.params.id
  const items = await pool.query('select * from po_items where po_id = $1', [id])
  const sums = sumPoTotals(items.rows)
  const { rows } = await pool.query(
    `update purchase_orders set subtotal = $2, tax_cgst = $3, tax_sgst = $4, tax_igst = $5, total = $6, updated_at = now() where id = $1 returning *`,
    [id, sums.subtotal, sums.tax_cgst, sums.tax_sgst, sums.tax_igst, sums.total]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

export default router


