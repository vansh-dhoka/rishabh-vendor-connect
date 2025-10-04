import { Router } from 'express'
import { pool } from '../db.js'
import { enforceCompanyScope } from '../middleware/auth.js'
import { asyncHandler, ValidationError, handleDatabaseError } from '../utils/errorHandler.js'

const router = Router()

// List RFQs
router.get('/', enforceCompanyScope, asyncHandler(async (req, res) => {
  const companyId = req.query.company_id || null
  const projectId = req.query.project_id || null
  const status = req.query.status || null
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  
  let query = 'select * from quotation_requests where 1=1'
  let params = []
  let paramCount = 0
  
  if (projectId) {
    paramCount++
    query += ` and project_id = $${paramCount}`
    params.push(projectId)
  } else if (companyId) {
    paramCount++
    query += ` and company_id = $${paramCount}`
    params.push(companyId)
  }
  
  if (status) {
    paramCount++
    query += ` and status = $${paramCount}`
    params.push(status)
  }
  
  query += ` order by created_at desc limit $${paramCount + 1} offset $${paramCount + 2}`
  params.push(limit, offset)
  
  try {
    const { rows } = await pool.query(query, params)
    res.json({ items: rows, limit, offset })
  } catch (error) {
    handleDatabaseError(error, 'fetching RFQs')
  }
}))

// Create RFQ with items
router.post('/', enforceCompanyScope, asyncHandler(async (req, res) => {
  const client = await pool.connect()
  try {
    const { company_id, project_id, title, description, due_date, items } = req.body || {}
    
    if (!company_id) {
      throw new ValidationError('Company ID is required', 'company_id', company_id)
    }
    if (!title || String(title).trim().length === 0) {
      throw new ValidationError('RFQ title is required', 'title', title)
    }
    
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
  } catch (error) {
    await (client.query('rollback').catch(() => {}))
    handleDatabaseError(error, 'creating RFQ')
  } finally {
    client.release()
  }
}))

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
router.post('/:id/approve', enforceCompanyScope, asyncHandler(async (req, res) => {
  const rfqId = req.params.id
  const { vendor_quote_id } = req.body || {}
  
  if (!vendor_quote_id) {
    throw new ValidationError('Vendor quote ID is required', 'vendor_quote_id', vendor_quote_id)
  }
  
  const client = await pool.connect()
  try {
    await client.query('begin')
    
    // Get RFQ details
    const rfq = await client.query('select * from quotation_requests where id = $1', [rfqId])
    if (rfq.rows.length === 0) {
      throw new ValidationError('RFQ not found', 'rfq_id', rfqId)
    }
    
    // Get vendor quote details
    const vq = await client.query('select * from vendor_quotes where id = $1 and rfq_id = $2', [vendor_quote_id, rfqId])
    if (vq.rows.length === 0) {
      throw new ValidationError('Vendor quote not found', 'vendor_quote_id', vendor_quote_id)
    }
    
    const vendorId = vq.rows[0].vendor_id
    const poNumber = `PO-${Date.now()}` // Simple PO number generation

    // Create Purchase Order
    const po = await client.query(
      `insert into purchase_orders (company_id, project_id, vendor_id, rfq_id, po_number, status, subtotal, total)
       values ($1,$2,$3,$4,$5,'issued', $6, $6)
       returning *`,
      [rfq.rows[0].company_id, rfq.rows[0].project_id, vendorId, rfqId, poNumber, vq.rows[0].total]
    )
    const poId = po.rows[0].id

    // Create PO items from vendor quote items
    const vqItems = await client.query('select * from vendor_quote_items where vendor_quote_id = $1', [vendor_quote_id])
    for (const it of vqItems.rows) {
      await client.query(
        `insert into po_items (po_id, item_id, description, hsn_sac_code, gst_rate, quantity, unit_rate, line_subtotal, tax_cgst, tax_sgst, tax_igst, line_total)
         values ($1, null, $2, $3, coalesce($4,0.00), coalesce($5,1), coalesce($6,0.00), $7, 0.00, 0.00, 0.00, $7)`,
        [poId, it.description || null, it.hsn_sac_code || null, it.gst_rate ?? null, it.quantity ?? null, it.unit_rate ?? null, it.line_total]
      )
    }

    // Close the RFQ
    await client.query("update quotation_requests set status = 'closed', updated_at = now() where id = $1", [rfqId])
    await client.query('commit')
    
    res.status(201).json({ 
      purchase_order: po.rows[0],
      message: 'RFQ approved and Purchase Order created successfully'
    })
  } catch (error) {
    await (client.query('rollback').catch(() => {}))
    handleDatabaseError(error, 'approving RFQ and creating PO')
  } finally {
    client.release()
  }
}))

export default router


