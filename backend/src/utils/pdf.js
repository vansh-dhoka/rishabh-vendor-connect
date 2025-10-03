import PDFDocument from 'pdfkit'

export function createInvoicePdfStream(invoice) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  // Header
  doc.fontSize(20).text('INVOICE', { align: 'center' })
  doc.moveDown()

  // Invoice details
  doc.fontSize(12)
  doc.text(`Invoice Number: ${invoice.invoiceNumber || invoice.id}`)
  doc.text(`Date: ${invoice.date}`)
  if (invoice.dueDate) doc.text(`Due Date: ${invoice.dueDate}`)
  if (invoice.poNumber) doc.text(`PO Number: ${invoice.poNumber}`)
  doc.moveDown()

  // Company and vendor info
  doc.text(`From: ${invoice.vendorName}`)
  doc.text(`To: ${invoice.companyName}`)
  doc.moveDown()

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

  let currentY = tableTop + 20

  // Items
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

  // Totals
  currentY += 10
  doc.fontSize(12)
  doc.text(`Subtotal: ${invoice.subtotal}`, 400, currentY)
  currentY += 20
  if (invoice.cgst > 0) doc.text(`CGST: ${invoice.cgst}`, 400, currentY)
  if (invoice.sgst > 0) doc.text(`SGST: ${invoice.sgst}`, 400, currentY)
  if (invoice.igst > 0) doc.text(`IGST: ${invoice.igst}`, 400, currentY)
  currentY += 20
  doc.fontSize(14).text(`Total: ${invoice.total}`, 400, currentY)

  doc.end()
  return doc
}


