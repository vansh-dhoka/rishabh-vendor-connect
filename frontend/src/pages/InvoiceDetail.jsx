import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getInvoice, updateStatus, generatePDF } from '../services/invoicesService'

export default function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const d = await getInvoice(id)
      setInvoice(d)
    } catch (e) {
      setError('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [id])

  async function handleStatusUpdate(status) {
    try {
      const updated = await updateStatus(id, status)
      setInvoice(updated)
    } catch (e) {
      alert('Failed to update status')
    }
  }

  async function handleGeneratePDF() {
    setPdfLoading(true)
    try {
      const blob = await generatePDF(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoice_number || invoice.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to generate PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>
  if (!invoice) return null

  return (
    <div style={{ padding: 24 }}>
      <h3>Invoice {invoice.invoice_number || invoice.id.slice(0, 8)}</h3>
      
      <div style={{ marginBottom: 16 }}>
        <div>Status: 
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '4px', 
            marginLeft: 8,
            backgroundColor: invoice.status === 'approved' ? '#d4edda' : 
                           invoice.status === 'paid' ? '#cce5ff' :
                           invoice.status === 'rejected' ? '#f8d7da' : '#fff3cd',
            color: invoice.status === 'approved' ? '#155724' :
                  invoice.status === 'paid' ? '#004085' :
                  invoice.status === 'rejected' ? '#721c24' : '#856404'
          }}>
            {invoice.status}
          </span>
        </div>
        <div>Date: {invoice.invoice_date}</div>
        <div>Due Date: {invoice.due_date || '-'}</div>
        <div>PO ID: {invoice.po_id || '-'}</div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button 
          onClick={() => handleStatusUpdate('approved')}
          disabled={invoice.status === 'approved' || invoice.status === 'paid'}
          style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
        >
          Approve
        </button>
        <button 
          onClick={() => handleStatusUpdate('rejected')}
          disabled={invoice.status === 'rejected' || invoice.status === 'paid'}
          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
        >
          Reject
        </button>
        <button 
          onClick={() => handleStatusUpdate('paid')}
          disabled={invoice.status === 'paid' || invoice.status === 'rejected'}
          style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
        >
          Mark Paid
        </button>
        <button 
          onClick={handleGeneratePDF}
          disabled={pdfLoading}
          style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
        >
          {pdfLoading ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>Amounts</h4>
        <div>Subtotal: {invoice.subtotal}</div>
        <div>CGST: {invoice.tax_cgst}</div>
        <div>SGST: {invoice.tax_sgst}</div>
        <div>IGST: {invoice.tax_igst}</div>
        <div><strong>Total: {invoice.total}</strong></div>
      </div>

      {invoice.pdf_path && (
        <div style={{ marginBottom: 16 }}>
          <h4>Uploaded Invoice</h4>
          <div>File: {invoice.pdf_path}</div>
        </div>
      )}
    </div>
  )
}
