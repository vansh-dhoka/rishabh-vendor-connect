import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { pool } from '../db.js'
import { createInvoicePdfStream } from '../utils/pdf.js'
import { createInvoicePdfWithTemplate, createStructuredPdfPath } from '../utils/pdfTemplates.js'
import { enforceCompanyScope } from '../middleware/auth.js'
import { validateFileType, validateFileSize } from '../middleware/validation.js'
import { withTransaction } from '../utils/transactions.js'
import { getAuditInfo, logAuditEvent } from '../utils/audit.js'

const router = Router()

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
const invoiceDir = path.join(uploadDir, 'invoices')

// Ensure upload directory exists
import fs from 'fs'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, invoiceDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter for security
const fileFilter = (req, file, cb) => {
  if (!validateFileType(file.originalname)) {
    return cb(new Error('Invalid file type. Only PDF, JPG, JPEG, PNG allowed.'), false)
  }
  cb(null, true)
}

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// List invoices
router.get('/', enforceCompanyScope, async (req, res) => {
  const poId = req.query.po_id || null
  const limit = Math.min(Number(req.query.limit || 50), 200)
  const offset = Number(req.query.offset || 0)
  let rows
  if (poId) {
    ({ rows } = await pool.query(
      'select * from invoices where po_id = $1 and company_id = $2 order by created_at desc limit $3 offset $4',
      [poId, req.scope.company_id, limit, offset]
    ))
  } else {
    ({ rows } = await pool.query(
      'select * from invoices where company_id = $1 order by created_at desc limit $2 offset $3',
      [req.scope.company_id, limit, offset]
    ))
  }
  res.json({ items: rows, limit, offset })
})

// Create invoice from PO
router.post('/from-po', async (req, res) => {
  const { po_id, invoice_number, due_date } = req.body || {}
  if (!po_id) return res.status(400).json({ error: 'po_id_required' })
  
  const client = await pool.connect()
  try {
    await client.query('begin')
    
    // Get PO details
    const po = await client.query('select * from purchase_orders where id = $1', [po_id])
    if (po.rows.length === 0) return res.status(404).json({ error: 'po_not_found' })
    
    const poData = po.rows[0]
    
    // Create invoice
    const invoice = await client.query(
      `insert into invoices (company_id, vendor_id, po_id, invoice_number, due_date, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total)
       values ($1,$2,$3,$4,$5,'submitted',$6,$7,$8,$9,$10,$11)
       returning *`,
      [
        poData.company_id,
        poData.vendor_id,
        po_id,
        invoice_number || null,
        due_date || null,
        poData.currency || 'INR',
        poData.subtotal,
        poData.tax_cgst,
        poData.tax_sgst,
        poData.tax_igst,
        poData.total
      ]
    )
    
    await client.query('commit')
    res.status(201).json(invoice.rows[0])
  } catch (e) {
    await (client.query('rollback').catch(() => {}))
    if ((e.code || '') === '23503') return res.status(400).json({ error: 'invalid_fk' })
    throw e
  } finally {
    client.release()
  }
})

// Upload invoice file
router.post('/:id/upload', enforceCompanyScope, upload.single('invoice'), async (req, res) => {
  const invoiceId = req.params.id
  if (!req.file) return res.status(400).json({ error: 'no_file_uploaded' })
  
  // Additional file size validation
  if (!validateFileSize(req.file.size)) {
    return res.status(400).json({ error: 'File too large. Maximum 10MB allowed.' })
  }
  
  const pdfPath = req.file.path
  const { rows } = await pool.query(
    'update invoices set pdf_path = $2, updated_at = now() where id = $1 and company_id = $3 returning *',
    [invoiceId, pdfPath, req.scope.company_id]
  )
  
  if (rows.length === 0) return res.status(404).json({ error: 'invoice_not_found' })
  res.json(rows[0])
})

// Update invoice status
router.patch('/:id/status', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const { status } = req.body || {}
  const allowed = ['draft','submitted','approved','paid','rejected','cancelled']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid_status' })
  
  // Get current invoice and PO status
  const invoice = await pool.query(
    'select i.*, po.status as po_status from invoices i left join purchase_orders po on i.po_id = po.id where i.id = $1 and i.company_id = $2',
    [id, req.scope.company_id]
  )
  if (invoice.rows.length === 0) return res.status(404).json({ error: 'not_found' })
  
  // Validate PO is approved before invoice approval
  if (status === 'approved' && invoice.rows[0].po_id && invoice.rows[0].po_status !== 'approved') {
    return res.status(400).json({ 
      error: 'po_not_approved', 
      message: 'Cannot approve invoice for unapproved PO' 
    })
  }
  
  const { rows } = await pool.query(
    'update invoices set status = $2, updated_at = now() where id = $1 and company_id = $3 returning *',
    [id, status, req.scope.company_id]
  )
  
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(rows[0])
})

// Generate and download invoice PDF
router.get('/:id/pdf', async (req, res) => {
  const invoiceId = req.params.id
  
  // Get invoice with PO and vendor details
  const invoice = await pool.query(`
    select i.*, v.name as vendor_name, c.name as company_name, p.po_number
    from invoices i
    left join vendors v on i.vendor_id = v.id
    left join companies c on i.company_id = c.id
    left join purchase_orders p on i.po_id = p.id
    where i.id = $1
  `, [invoiceId])
  
  if (invoice.rows.length === 0) return res.status(404).json({ error: 'invoice_not_found' })
  
  const invoiceData = invoice.rows[0]
  
  // Get PO items for line details
  const items = await pool.query(`
    select * from po_items where po_id = $1
  `, [invoiceData.po_id])
  
  const pdfData = {
    id: invoiceData.id,
    invoiceNumber: invoiceData.invoice_number,
    vendorName: invoiceData.vendor_name,
    companyName: invoiceData.company_name,
    poNumber: invoiceData.po_number,
    date: invoiceData.invoice_date,
    dueDate: invoiceData.due_date,
    items: items.rows.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.unit_rate,
      hsn: item.hsn_sac_code,
      gstRate: item.gst_rate,
      subtotal: item.line_subtotal,
      cgst: item.tax_cgst,
      sgst: item.tax_sgst,
      igst: item.tax_igst,
      total: item.line_total
    })),
    subtotal: invoiceData.subtotal,
    cgst: invoiceData.tax_cgst,
    sgst: invoiceData.tax_sgst,
    igst: invoiceData.tax_igst,
    total: invoiceData.total
  }
  
  const stream = createInvoicePdfStream(pdfData)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceData.invoice_number || invoiceData.id}.pdf"`)
  stream.pipe(res)
})

// Get invoice details
router.get('/:id', enforceCompanyScope, async (req, res) => {
  const id = req.params.id
  const invoice = await pool.query('select * from invoices where id = $1 and company_id = $2', [id, req.scope.company_id])
  if (invoice.rows.length === 0) return res.status(404).json({ error: 'not_found' })
  res.json(invoice.rows[0])
})

// Enhanced PDF generation with templates
router.get('/:id/pdf-enhanced', enforceCompanyScope, async (req, res) => {
  const invoiceId = req.params.id
  
  try {
    // Get invoice with PO and vendor details
    const invoice = await pool.query(`
      select i.*, v.name as vendor_name, c.name as company_name, p.po_number, p.project_id
      from invoices i
      left join vendors v on i.vendor_id = v.id
      left join companies c on i.company_id = c.id
      left join purchase_orders p on i.po_id = p.id
      where i.id = $1 and i.company_id = $2 and i.is_deleted = false
    `, [invoiceId, req.scope.company_id])
    
    if (invoice.rows.length === 0) return res.status(404).json({ error: 'invoice_not_found' })
    
    const invoiceData = invoice.rows[0]
    
    // Get detailed company and vendor data
    const [companyData, vendorData] = await Promise.all([
      pool.query('select * from companies where id = $1', [invoiceData.company_id]),
      pool.query('select * from vendors where id = $1', [invoiceData.vendor_id])
    ])
    
    const company = companyData.rows[0]
    const vendor = vendorData.rows[0]
    
    // Get invoice items if available
    const itemsData = await pool.query('select * from po_items where po_id = $1', [invoiceData.po_id || ''])
    invoiceData.items = itemsData.rows
    
    // Create structured PDF path
    const pdfPath = createStructuredPdfPath(invoiceData.company_id, invoiceData.project_id, 'invoice', invoiceData.id)
    
    // Generate PDF with template
    const doc = createInvoicePdfWithTemplate(invoiceData, company, vendor, { po_number: invoiceData.po_number })
    
    // Save PDF to structured path
    const writeStream = require('fs').createWriteStream(pdfPath)
    doc.pipe(writeStream)
    
    writeStream.on('finish', () => {
      // Update invoice with PDF path
      pool.query('update invoices set pdf_path = $1 where id = $2', [pdfPath, invoiceId])
      
      // Stream PDF to client
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceData.invoice_number || invoiceData.id}.pdf"`)
      require('fs').createReadStream(pdfPath).pipe(res)
    })
    
    writeStream.on('error', (error) => {
      console.error('Error writing PDF:', error)
      res.status(500).json({ error: 'Failed to generate PDF' })
    })
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

export default router