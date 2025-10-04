import { useEffect, useMemo, useState } from 'react'
import { listRfqs, listVendorQuotes } from '../services/rfqsService'
import { createFromQuote } from '../services/purchaseOrdersService'
import PageLayout from '../components/PageLayout'

export default function POCreateFromQuote() {
  const [rfqs, setRfqs] = useState([])
  const [rfqId, setRfqId] = useState('')
  const [quotes, setQuotes] = useState([])
  const [vendorQuoteId, setVendorQuoteId] = useState('')
  const [taxMode, setTaxMode] = useState('intra')
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const disabled = useMemo(() => !vendorQuoteId, [vendorQuoteId])

  useEffect(() => { (async () => { const r = await listRfqs({ limit: 200 }); setRfqs(r.items || []) })() }, [])
  useEffect(() => { (async () => { if (!rfqId) { setQuotes([]); return } const q = await listVendorQuotes(rfqId); setQuotes(q.items || []) })() }, [rfqId])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const po = await createFromQuote({ vendor_quote_id: vendorQuoteId, tax_mode: taxMode })
      setOk(`Purchase Order created successfully: ${po.po_number}`)
      setRfqId('')
      setVendorQuoteId('')
      setTaxMode('intra')
    } catch (e) {
      setError('Failed to create Purchase Order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      title="Create Purchase Order from Quote"
      subtitle="Convert an approved vendor quote into a purchase order"
    >
      {error && <div className="error-message">{error}</div>}
      {ok && <div className="success-message">{ok}</div>}
      
      <form onSubmit={submit}>
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">📄</span>
            <h3 className="form-section-title">Quote Selection</h3>
          </div>
          
          <div className="responsive-grid-sm">
            <div className="form-group">
              <label className="form-label">Request for Quotation (RFQ)</label>
              <select 
                className="form-input" 
                value={rfqId} 
                onChange={e => setRfqId(e.target.value)}
              >
                <option value="">Select RFQ</option>
                {rfqs.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
              <div className="text-xs text-muted mt-1">
                Select the RFQ to view available vendor quotes
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Vendor Quote</label>
              <select 
                className="form-input" 
                value={vendorQuoteId} 
                onChange={e => setVendorQuoteId(e.target.value)}
                disabled={!rfqId}
              >
                <option value="">Select Quote</option>
                {quotes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.id.slice(0, 8)} — ₹{parseFloat(q.total || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted mt-1">
                {quotes.length > 0 ? `${quotes.length} quote(s) available` : 'No quotes available for selected RFQ'}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">🏛️</span>
            <h3 className="form-section-title">Tax Configuration</h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">Tax Mode</label>
            <select 
              className="form-input" 
              value={taxMode} 
              onChange={e => setTaxMode(e.target.value)}
            >
              <option value="intra">Intra-state (CGST + SGST)</option>
              <option value="inter">Inter-state (IGST)</option>
            </select>
            <div className="text-xs text-muted mt-1">
              {taxMode === 'intra' 
                ? 'For transactions within the same state - applies CGST and SGST'
                : 'For transactions between different states - applies IGST'
              }
            </div>
          </div>
        </div>

        {vendorQuoteId && (
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">💰</span>
              <h3 className="form-section-title">Quote Summary</h3>
            </div>
            
            <div className="info-card">
              <div className="info-card-header">
                <span className="info-card-icon">📊</span>
                <div>
                  <h4 className="info-card-title">Selected Quote</h4>
                  <p className="info-card-subtitle">Quote details and pricing</p>
                </div>
              </div>
              
              {(() => {
                const selectedQuote = quotes.find(q => q.id === vendorQuoteId)
                return selectedQuote ? (
                  <div className="responsive-grid-sm">
                    <div>
                      <div className="text-sm text-muted">Quote ID</div>
                      <div className="text-sm font-mono">{selectedQuote.id.slice(0, 8)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted">Vendor</div>
                      <div className="text-sm font-weight-medium">{selectedQuote.vendor_id?.slice(0, 8) || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted">Total Amount</div>
                      <div className="text-lg font-weight-semibold text-primary">
                        ₹{parseFloat(selectedQuote.total || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted">Status</div>
                      <div className="text-sm font-weight-medium">{selectedQuote.status || 'N/A'}</div>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="action-group">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={disabled || loading}
            >
              {loading ? 'Creating PO...' : 'Create Purchase Order'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setRfqId('')
                setVendorQuoteId('')
                setTaxMode('intra')
                setError('')
                setOk('')
              }}
            >
              Reset Form
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  )
}


