import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createStructuredPdfPath(companyId, projectId, documentType, documentId) {
  const baseDir = process.env.PDF_STORAGE_DIR || '/tmp/pdfs'
  const pdfPath = path.join(baseDir, companyId, projectId || 'general', `${documentType}_${documentId}.pdf`)
  
  // Ensure directory exists
  const dir = path.dirname(pdfPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  return pdfPath
}

export function createInvoicePdfWithTemplate(invoice, company, vendor, po = null) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  
  // Add logo
  const logoPath = path.join(__dirname, '../assets/logo.jpeg')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 50, { width: 100, height: 50 })
  }
  
  // Header with company name
  doc.fontSize(20).text('Rishabh Vendor Connect', { align: 'center' })
  doc.fontSize(16).text('INVOICE', { align: 'center' })
  doc.moveDown(0.5)
  
  // Company info
  doc.fontSize(12)
  doc.text(`${company.name}`, { align: 'left' })
  if (company.gstin) doc.text(`GSTIN: ${company.gstin}`)
  if (company.address_line1) doc.text(company.address_line1)
  if (company.address_line2) doc.text(company.address_line2)
  if (company.city) doc.text(`${company.city}, ${company.state || ''} ${company.postal_code || ''}`)
  doc.moveDown(1)
  
  // Invoice details
  doc.text(`Invoice Number: ${invoice.invoice_number || invoice.id}`, { align: 'right' })
  doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, { align: 'right' })
  if (invoice.due_date) doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, { align: 'right' })
  if (po?.po_number) doc.text(`PO Number: ${po.po_number}`, { align: 'right' })
  doc.moveDown(1)
  
  // Bill to section
  doc.text('Bill To:', { underline: true })
  doc.text(`${vendor.name}`)
  if (vendor.gstin) doc.text(`GSTIN: ${vendor.gstin}`)
  if (vendor.address_line1) doc.text(vendor.address_line1)
  if (vendor.address_line2) doc.text(vendor.address_line2)
  if (vendor.city) doc.text(`${vendor.city}, ${vendor.state || ''} ${vendor.postal_code || ''}`)
  doc.moveDown(1)
  
  // Items table header
  const tableTop = doc.y
  doc.fontSize(10)
  doc.text('Description', 50, tableTop)
  doc.text('HSN', 200, tableTop)
  doc.text('Qty', 250, tableTop)
  doc.text('Rate', 280, tableTop)
  doc.text('GST%', 320, tableTop)
  doc.text('Subtotal', 360, tableTop)
  doc.text('CGST', 420, tableTop)
  doc.text('SGST', 460, tableTop)
  doc.text('IGST', 500, tableTop)
  doc.text('Total', 540, tableTop)
  
  // Draw line under header
  doc.moveTo(50, tableTop + 15).lineTo(580, tableTop + 15).stroke()
  
  let currentY = tableTop + 25
  
  // Items
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item) => {
      doc.text(item.description || '', 50, currentY, { width: 140 })
      doc.text(item.hsn || '', 200, currentY)
      doc.text(String(item.quantity || 0), 250, currentY)
      doc.text(String(item.rate || 0), 280, currentY)
      doc.text(String(item.gstRate || 0), 320, currentY)
      doc.text(String(item.subtotal || 0), 360, currentY)
      doc.text(String(item.cgst || 0), 420, currentY)
      doc.text(String(item.sgst || 0), 460, currentY)
      doc.text(String(item.igst || 0), 500, currentY)
      doc.text(String(item.total || 0), 540, currentY)
      currentY += 20
    })
  }
  
  // Draw line under items
  doc.moveTo(50, currentY - 5).lineTo(580, currentY - 5).stroke()
  
  // Totals
  currentY += 10
  doc.fontSize(12)
  doc.text(`Subtotal: ₹${invoice.subtotal || 0}`, 400, currentY)
  currentY += 20
  if (invoice.tax_cgst > 0) doc.text(`CGST: ₹${invoice.tax_cgst}`, 400, currentY)
  if (invoice.tax_sgst > 0) doc.text(`SGST: ₹${invoice.tax_sgst}`, 400, currentY)
  if (invoice.tax_igst > 0) doc.text(`IGST: ₹${invoice.tax_igst}`, 400, currentY)
  currentY += 20
  doc.fontSize(14).text(`Total: ₹${invoice.total || 0}`, 400, currentY)
  
  // Footer
  doc.fontSize(8)
  doc.text('Thank you for your business!', { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' })
  
  doc.end()
  return doc
}

export function createPOPdfWithTemplate(po, company, vendor, project = null) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  
  // Add logo
  const logoPath = path.join(__dirname, '../assets/logo.jpeg')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 50, { width: 100, height: 50 })
  }
  
  // Header with company name
  doc.fontSize(20).text('Rishabh Vendor Connect', { align: 'center' })
  doc.fontSize(16).text('PURCHASE ORDER', { align: 'center' })
  doc.moveDown(0.5)
  
  // Company info
  doc.fontSize(12)
  doc.text(`${company.name}`, { align: 'left' })
  if (company.gstin) doc.text(`GSTIN: ${company.gstin}`)
  if (company.address_line1) doc.text(company.address_line1)
  if (company.address_line2) doc.text(company.address_line2)
  if (company.city) doc.text(`${company.city}, ${company.state || ''} ${company.postal_code || ''}`)
  doc.moveDown(1)
  
  // PO details
  doc.text(`PO Number: ${po.po_number || po.id}`, { align: 'right' })
  doc.text(`Date: ${new Date(po.issue_date).toLocaleDateString()}`, { align: 'right' })
  doc.text(`Status: ${po.status.toUpperCase()}`, { align: 'right' })
  if (project?.name) doc.text(`Project: ${project.name}`, { align: 'right' })
  doc.moveDown(1)
  
  // Vendor section
  doc.text('Vendor:', { underline: true })
  doc.text(`${vendor.name}`)
  if (vendor.gstin) doc.text(`GSTIN: ${vendor.gstin}`)
  if (vendor.address_line1) doc.text(vendor.address_line1)
  if (vendor.address_line2) doc.text(vendor.address_line2)
  if (vendor.city) doc.text(`${vendor.city}, ${vendor.state || ''} ${vendor.postal_code || ''}`)
  doc.moveDown(1)
  
  // Items table header
  const tableTop = doc.y
  doc.fontSize(10)
  doc.text('Description', 50, tableTop)
  doc.text('HSN', 200, tableTop)
  doc.text('Qty', 250, tableTop)
  doc.text('Rate', 280, tableTop)
  doc.text('GST%', 320, tableTop)
  doc.text('Subtotal', 360, tableTop)
  doc.text('CGST', 420, tableTop)
  doc.text('SGST', 460, tableTop)
  doc.text('IGST', 500, tableTop)
  doc.text('Total', 540, tableTop)
  
  // Draw line under header
  doc.moveTo(50, tableTop + 15).lineTo(580, tableTop + 15).stroke()
  
  let currentY = tableTop + 25
  
  // Items
  if (po.items && po.items.length > 0) {
    po.items.forEach((item) => {
      doc.text(item.description || '', 50, currentY, { width: 140 })
      doc.text(item.hsn_sac_code || '', 200, currentY)
      doc.text(String(item.quantity || 0), 250, currentY)
      doc.text(String(item.unit_rate || 0), 280, currentY)
      doc.text(String(item.gst_rate || 0), 320, currentY)
      doc.text(String(item.line_subtotal || 0), 360, currentY)
      doc.text(String(item.tax_cgst || 0), 420, currentY)
      doc.text(String(item.tax_sgst || 0), 460, currentY)
      doc.text(String(item.tax_igst || 0), 500, currentY)
      doc.text(String(item.line_total || 0), 540, currentY)
      currentY += 20
    })
  }
  
  // Draw line under items
  doc.moveTo(50, currentY - 5).lineTo(580, currentY - 5).stroke()
  
  // Totals
  currentY += 10
  doc.fontSize(12)
  doc.text(`Subtotal: ₹${po.subtotal || 0}`, 400, currentY)
  currentY += 20
  if (po.tax_cgst > 0) doc.text(`CGST: ₹${po.tax_cgst}`, 400, currentY)
  if (po.tax_sgst > 0) doc.text(`SGST: ₹${po.tax_sgst}`, 400, currentY)
  if (po.tax_igst > 0) doc.text(`IGST: ₹${po.tax_igst}`, 400, currentY)
  currentY += 20
  doc.fontSize(14).text(`Total: ₹${po.total || 0}`, 400, currentY)
  
  // Footer
  doc.fontSize(8)
  doc.text('Please deliver goods as per specifications.', { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' })
  
  doc.end()
  return doc
}
