import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPO, updateStatus } from '../services/purchaseOrdersService'
import PageLayout from '../components/PageLayout'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'

export default function PODetail() {
  const { id } = useParams()
  const [po, setPo] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const d = await getPO(id)
      setPo(d)
      setStatus(d.status)
    } catch (e) {
      setError('Failed to load PO')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [id])

  async function saveStatus() {
    setSaving(true)
    try { 
      const d = await updateStatus(id, status)
      setPo(d) 
    } catch { 
      alert('Failed to update status') 
    } finally {
      setSaving(false)
    }
  }

  const itemColumns = [
    {
      header: 'Description',
      key: 'description',
      render: (row) => (
        <div className="font-weight-medium">
          {row.description}
        </div>
      )
    },
    {
      header: 'HSN/SAC',
      key: 'hsn_sac_code',
      render: (row) => (
        <div className="text-sm font-mono text-muted">
          {row.hsn_sac_code || 'N/A'}
        </div>
      )
    },
    {
      header: 'GST %',
      key: 'gst_rate',
      render: (row) => (
        <div className="text-sm">
          {row.gst_rate}%
        </div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (row) => (
        <div className="text-sm font-weight-medium">
          {row.quantity}
        </div>
      )
    },
    {
      header: 'Unit Rate',
      key: 'unit_rate',
      render: (row) => (
        <div className="text-sm font-weight-medium">
          ₹{parseFloat(row.unit_rate || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Subtotal',
      key: 'line_subtotal',
      render: (row) => (
        <div className="text-sm font-weight-medium">
          ₹{parseFloat(row.line_subtotal || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'CGST',
      key: 'tax_cgst',
      render: (row) => (
        <div className="text-sm">
          ₹{parseFloat(row.tax_cgst || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'SGST',
      key: 'tax_sgst',
      render: (row) => (
        <div className="text-sm">
          ₹{parseFloat(row.tax_sgst || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'IGST',
      key: 'tax_igst',
      render: (row) => (
        <div className="text-sm">
          ₹{parseFloat(row.tax_igst || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Total',
      key: 'line_total',
      render: (row) => (
        <div className="text-sm font-weight-semibold text-primary">
          ₹{parseFloat(row.line_total || 0).toLocaleString()}
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title={`Purchase Order ${po?.po_number || ''}`}
      subtitle="View and manage purchase order details"
      loading={loading}
      error={error}
    >
      {po && (
        <>
          {/* PO Overview */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">📄</span>
              <h3 className="form-section-title">Purchase Order Overview</h3>
            </div>
            
            <div className="responsive-grid-sm">
              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📊</span>
                  <div>
                    <h4 className="info-card-title">Status</h4>
                    <p className="info-card-subtitle">Current PO status</p>
                  </div>
                </div>
                <StatusBadge status={po.status} type="po" />
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">🏢</span>
                  <div>
                    <h4 className="info-card-title">Vendor</h4>
                    <p className="info-card-subtitle">Vendor reference</p>
                  </div>
                </div>
                <div className="text-sm font-mono text-muted">
                  {po.vendor_id ? po.vendor_id.slice(0, 8) : 'N/A'}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📋</span>
                  <div>
                    <h4 className="info-card-title">Project</h4>
                    <p className="info-card-subtitle">Related project</p>
                  </div>
                </div>
                <div className="text-sm font-mono text-muted">
                  {po.project_id ? po.project_id.slice(0, 8) : 'N/A'}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📅</span>
                  <div>
                    <h4 className="info-card-title">Issue Date</h4>
                    <p className="info-card-subtitle">Date of PO creation</p>
                  </div>
                </div>
                <div className="text-lg font-weight-medium">
                  {po.issue_date ? new Date(po.issue_date).toLocaleDateString() : 'N/A'}
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
                  ₹{parseFloat(po.subtotal || 0).toLocaleString()}
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
                  ₹{parseFloat(po.tax_cgst || 0).toLocaleString()}
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
                  ₹{parseFloat(po.tax_sgst || 0).toLocaleString()}
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
                  ₹{parseFloat(po.tax_igst || 0).toLocaleString()}
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
                  ₹{parseFloat(po.total || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">⚡</span>
              <h3 className="form-section-title">Status Management</h3>
            </div>
            
            <div className="action-group">
              <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                <label className="form-label">Update Status</label>
                <select 
                  className="form-input" 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="issued">Issued</option>
                  <option value="accepted">Accepted</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button 
                className="btn btn-primary"
                onClick={saveStatus}
                disabled={saving || status === po.status}
              >
                {saving ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">📦</span>
              <h3 className="form-section-title">Purchase Order Items</h3>
            </div>
            
            <DataTable
              data={po.items || []}
              columns={itemColumns}
              loading={false}
              emptyMessage="No items found in this purchase order."
            />
          </div>
        </>
      )}
    </PageLayout>
  )
}


