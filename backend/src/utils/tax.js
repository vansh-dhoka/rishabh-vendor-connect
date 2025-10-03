export function computeLineTotals(quantity, unitRate, gstRate, mode = 'intra') {
  const qty = Number(quantity || 1)
  const rate = Number(unitRate || 0)
  const gst = Number(gstRate || 0)

  const lineSubtotal = +(qty * rate).toFixed(2)
  let taxCgst = 0
  let taxSgst = 0
  let taxIgst = 0

  if (gst > 0) {
    if (mode === 'inter') {
      taxIgst = +((lineSubtotal * gst) / 100).toFixed(2)
    } else {
      const half = gst / 2
      taxCgst = +((lineSubtotal * half) / 100).toFixed(2)
      taxSgst = +((lineSubtotal * half) / 100).toFixed(2)
    }
  }

  const lineTotal = +(lineSubtotal + taxCgst + taxSgst + taxIgst).toFixed(2)
  return { lineSubtotal, taxCgst, taxSgst, taxIgst, lineTotal }
}

export function sumPoTotals(lines) {
  let subtotal = 0
  let cgst = 0
  let sgst = 0
  let igst = 0
  let total = 0
  for (const l of lines) {
    subtotal += Number(l.line_subtotal || 0)
    cgst += Number(l.tax_cgst || 0)
    sgst += Number(l.tax_sgst || 0)
    igst += Number(l.tax_igst || 0)
    total += Number(l.line_total || 0)
  }
  return {
    subtotal: +subtotal.toFixed(2),
    tax_cgst: +cgst.toFixed(2),
    tax_sgst: +sgst.toFixed(2),
    tax_igst: +igst.toFixed(2),
    total: +total.toFixed(2)
  }
}


