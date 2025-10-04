import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getInvoice, updateStatus, generatePDF } from '../services/invoicesService'
import PageLayout from '../components/PageLayout'
import StatusBadge from '../components/StatusBadge'

export default function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

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
    setActionLoading(true)
    try {
      const updated = await updateStatus(id, status)
      setInvoice(updated)
    } catch (e) {
      alert('Failed to update status')
    } finally {
      setActionLoading(false)
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

  return (
    <PageLayout
      title={`Invoice ${invoice?.invoice_number || invoice?.id?.slice(0, 8) || ''}`}
      subtitle="View and manage invoice details"
      loading={loading}
      error={error}
    >
      {invoice && (
        <>
          {/* Invoice Overview */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">📄</span>
              <h3 className="form-section-title">Invoice Overview</h3>
            </div>
            
            <div className="responsive-grid-sm">
              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📊</span>
                  <div>
                    <h4 className="info-card-title">Status</h4>
                    <p className="info-card-subtitle">Current invoice status</p>
                  </div>
                </div>
                <StatusBadge status={invoice.status} type="invoice" />
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📅</span>
                  <div>
                    <h4 className="info-card-title">Invoice Date</h4>
                    <p className="info-card-subtitle">Date of invoice creation</p>
                  </div>
                </div>
                <div className="text-lg font-weight-medium">
                  {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">⏰</span>
                  <div>
                    <h4 className="info-card-title">Due Date</h4>
                    <p className="info-card-subtitle">Payment due date</p>
                  </div>
                </div>
                <div className="text-lg font-weight-medium">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">🔗</span>
                  <div>
                    <h4 className="info-card-title">PO Reference</h4>
                    <p className="info-card-subtitle">Related purchase order</p>
                  </div>
                </div>
                <div className="text-sm font-mono text-muted">
                  {invoice.po_id ? invoice.po_id.slice(0, 8) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">💰</span>
              <h3 className="form-section-title">Financial Summary</h3>
            </div>
            
            <div className="responsive-grid">
              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📊</span>
                  <div>
                    <h4 className="info-card-title">Subtotal</h4>
                    <p className="info-card-subtitle">Amount before taxes</p>
                  </div>
                </div>
                <div className="text-xl font-weight-semibold text-primary">
                  ₹{parseFloat(invoice.subtotal || 0).toLocaleString()}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">🏛️</span>
                  <div>
                    <h4 className="info-card-title">CGST</h4>
                    <p className="info-card-subtitle">Central GST</p>
                  </div>
                </div>
                <div className="text-lg font-weight-medium">
                  ₹{parseFloat(invoice.tax_cgst || 0).toLocaleString()}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">🏛️</span>
                  <div>
                    <h4 className="info-card-title">SGST</h4>
                    <p className="info-card-subtitle">State GST</p>
                  </div>
                </div>
                <div className="text-lg font-weight-medium">
                  ₹{parseFloat(invoice.tax_sgst || 0).toLocaleString()}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">🌐</span>
                  <div>
                    <h4 className="info-card-title">IGST</h4>
                    <p className="info-card-subtitle">Integrated GST</p>
                  </div>
                </div>
                <div className="text-lg font-weight-medium">
                  ₹{parseFloat(invoice.tax_igst || 0).toLocaleString()}
                </div>
              </div>

              <div className="info-card" style={{ gridColumn: 'span 2' }}>
                <div className="info-card-header">
                  <span className="info-card-icon">💎</span>
                  <div>
                    <h4 className="info-card-title">Total Amount</h4>
                    <p className="info-card-subtitle">Final amount including all taxes</p>
                  </div>
                </div>
                <div className="text-3xl font-weight-bold text-success">
                  ₹{parseFloat(invoice.total || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">⚡</span>
              <h3 className="form-section-title">Actions</h3>
            </div>
            
            <div className="action-group">
              <button 
                className="btn btn-success"
                onClick={() => handleStatusUpdate('approved')}
                disabled={invoice.status === 'approved' || invoice.status === 'paid' || actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Approve Invoice'}
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={invoice.status === 'rejected' || invoice.status === 'paid' || actionLoading}
              >
                Reject Invoice
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleStatusUpdate('paid')}
                disabled={invoice.status === 'paid' || invoice.status === 'rejected' || actionLoading}
              >
                Mark as Paid
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleGeneratePDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>

          {/* Attachments */}
          {invoice.pdf_path && (
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-icon">📎</span>
                <h3 className="form-section-title">Attachments</h3>
              </div>
              
              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📄</span>
                  <div>
                    <h4 className="info-card-title">Uploaded Invoice</h4>
                    <p className="info-card-subtitle">Original invoice document</p>
                  </div>
                </div>
                <div className="text-sm font-mono text-muted">
                  {invoice.pdf_path}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  )
}
