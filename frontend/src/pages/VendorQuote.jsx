import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRfq, submitVendorQuote } from '../services/rfqsService'
import { listVendors } from '../services/vendorsService'
import PageLayout from '../components/PageLayout'

export default function VendorQuote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rfq, setRfq] = useState(null)
  const [vendors, setVendors] = useState([])
  const [vendorId, setVendorId] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const d = await getRfq(id)
        setRfq(d)
        setItems((d.items || []).map(i => ({ 
          rfq_item_id: i.id, 
          description: i.description, 
          quantity: i.quantity, 
          unit_rate: i.target_rate 
        })))
      } catch (e) {
        setError('Failed to load RFQ')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  useEffect(() => {
    async function loadVendors() {
      if (!rfq?.company_id) return
      try {
        const v = await listVendors({ company_id: rfq.company_id })
        setVendors(v.items || [])
      } catch (e) {
        console.error('Failed to load vendors:', e)
      }
    }
    loadVendors()
  }, [rfq?.company_id])

  function updateItem(idx, field, value) {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: value }
    setItems(next)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setSubmitting(true)
    try {
      await submitVendorQuote(id, { 
        vendor_id: vendorId, 
        items: items.map(i => ({ 
          rfq_item_id: i.rfq_item_id, 
          description: i.description, 
          quantity: Number(i.quantity || 1), 
          unit_rate: Number(i.unit_rate || 0) 
        })) 
      })
      setOk('Quote submitted successfully!')
      setTimeout(() => navigate(`/rfqs/${id}`), 1500)
    } catch (e) {
      setError('Failed to submit quote')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout
      title="Submit Vendor Quote"
      subtitle={`Submit your quote for RFQ: ${rfq?.title || ''}`}
      loading={loading}
      error={error}
    >
      {rfq && (
        <>
          {error && <div className="error-message">{error}</div>}
          {ok && <div className="success-message">{ok}</div>}
          
          <form onSubmit={submit}>
            {/* RFQ Information */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-icon">📋</span>
                <h3 className="form-section-title">RFQ Information</h3>
              </div>
              
              <div className="responsive-grid-sm">
                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-card-icon">📝</span>
                    <div>
                      <h4 className="info-card-title">RFQ Title</h4>
                      <p className="info-card-subtitle">Request details</p>
                    </div>
                  </div>
                  <div className="text-lg font-weight-medium">
                    {rfq.title}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-card-icon">📅</span>
                    <div>
                      <h4 className="info-card-title">Due Date</h4>
                      <p className="info-card-subtitle">Submission deadline</p>
                    </div>
                  </div>
                  <div className="text-lg font-weight-medium">
                    {rfq.due_date ? new Date(rfq.due_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-card-icon">📝</span>
                    <div>
                      <h4 className="info-card-title">Description</h4>
                      <p className="info-card-subtitle">RFQ details</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted">
                    {rfq.description || 'No description provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Selection */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-icon">🏢</span>
                <h3 className="form-section-title">Vendor Selection</h3>
              </div>
              
              <div className="form-group">
                <label className="form-label">Select Vendor *</label>
                <select 
                  className="form-input" 
                  value={vendorId} 
                  onChange={e => setVendorId(e.target.value)}
                  required
                >
                  <option value="">Select vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <div className="text-xs text-muted mt-1">
                  {vendors.length > 0 ? `${vendors.length} vendor(s) available` : 'No vendors available for this company'}
                </div>
              </div>
            </div>

            {/* Quote Items */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-icon">📦</span>
                <h3 className="form-section-title">Quote Items</h3>
              </div>
              
              <div className="table-container">
                <div className="table-header">
                  <h4 className="table-title">Item Pricing</h4>
                  <p className="table-subtitle">Provide your rates for each requested item</p>
                </div>
                
                <div className="p-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="responsive-grid-sm mb-4 p-4" style={{ 
                      border: '1px solid var(--gray-200)', 
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--gray-50)'
                    }}>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <input 
                          className="form-input" 
                          placeholder="Item description" 
                          value={item.description} 
                          onChange={e => updateItem(idx, 'description', e.target.value)} 
                          readOnly
                          style={{ backgroundColor: 'var(--gray-100)' }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Quantity" 
                          value={item.quantity} 
                          onChange={e => updateItem(idx, 'quantity', e.target.value)} 
                          min="1"
                          readOnly
                          style={{ backgroundColor: 'var(--gray-100)' }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Your Unit Rate (₹)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Enter your rate" 
                          value={item.unit_rate} 
                          onChange={e => updateItem(idx, 'unit_rate', e.target.value)} 
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      
                      <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
                        <div className="text-sm text-muted">
                          <div className="font-weight-medium">Line Total:</div>
                          <div className="text-lg font-weight-semibold text-primary">
                            ₹{((item.quantity || 0) * (item.unit_rate || 0)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center p-4" style={{ 
                    backgroundColor: 'var(--primary-50)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--primary-200)'
                  }}>
                    <div className="text-lg font-weight-semibold text-primary mb-2">
                      Total Quote Amount
                    </div>
                    <div className="text-2xl font-weight-bold text-primary">
                      ₹{items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_rate || 0)), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="form-section">
              <div className="action-group">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={!vendorId || submitting}
                >
                  {submitting ? 'Submitting Quote...' : 'Submit Quote'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate(`/rfqs/${id}`)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </PageLayout>
  )
}


