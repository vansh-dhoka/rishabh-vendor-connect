import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addNegotiation, approveRfq, getRfq, listNegotiations, listVendorQuotes } from '../services/rfqsService'
import PageLayout from '../components/PageLayout'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'

export default function RfqDetail() {
  const { id } = useParams()
  const [rfq, setRfq] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [negs, setNegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approveLoading, setApproveLoading] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState('')
  const [negMsg, setNegMsg] = useState('')
  const [negRate, setNegRate] = useState('')
  const [negLoading, setNegLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const d = await getRfq(id)
      setRfq(d)
      const q = await listVendorQuotes(id)
      setQuotes(q.items || [])
      const n = await listNegotiations(id)
      setNegs(n.items || [])
    } catch (e) {
      setError('Failed to load RFQ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [id])

  async function addNeg() {
    if (!negMsg && !negRate) return
    setNegLoading(true)
    try {
      await addNegotiation(id, { message: negMsg || null, offered_rate: negRate ? Number(negRate) : null, created_by: 'developer' })
      setNegMsg('')
      setNegRate('')
      const n = await listNegotiations(id)
      setNegs(n.items || [])
    } catch (e) {
      alert('Failed to add negotiation')
    } finally {
      setNegLoading(false)
    }
  }

  async function approve() {
    if (!selectedQuote) return
    setApproveLoading(true)
    try {
      await approveRfq(id, { vendor_quote_id: selectedQuote })
      await refresh()
      alert('Purchase Order created from selected quote')
    } catch (e) {
      alert('Approval failed')
    } finally {
      setApproveLoading(false)
    }
  }

  const quoteColumns = [
    {
      header: 'Quote ID',
      key: 'id',
      render: (row) => (
        <div className="text-sm font-mono text-muted">
          {row.id.slice(0, 8)}
        </div>
      )
    },
    {
      header: 'Vendor',
      key: 'vendor_id',
      render: (row) => (
        <div className="text-sm font-mono text-muted">
          {row.vendor_id ? row.vendor_id.slice(0, 8) : 'N/A'}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} type="quote" />
    },
    {
      header: 'Total Amount',
      key: 'total',
      render: (row) => (
        <div className="text-sm font-weight-semibold text-primary">
          ₹{parseFloat(row.total || 0).toLocaleString()}
        </div>
      )
    }
  ]

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
      header: 'Quantity',
      key: 'quantity',
      render: (row) => (
        <div className="text-sm font-weight-medium">
          {row.quantity}
        </div>
      )
    },
    {
      header: 'Target Rate',
      key: 'target_rate',
      render: (row) => (
        <div className="text-sm font-weight-medium">
          ₹{parseFloat(row.target_rate || 0).toLocaleString()}
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title={rfq?.title || 'RFQ Details'}
      subtitle="View and manage request for quotation details"
      loading={loading}
      error={error}
    >
      {rfq && (
        <>
          {/* RFQ Overview */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">📋</span>
              <h3 className="form-section-title">RFQ Overview</h3>
            </div>
            
            <div className="responsive-grid-sm">
              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📊</span>
                  <div>
                    <h4 className="info-card-title">Status</h4>
                    <p className="info-card-subtitle">Current RFQ status</p>
                  </div>
                </div>
                <StatusBadge status={rfq.status} type="quote" />
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
                  {rfq.project_id ? rfq.project_id.slice(0, 8) : 'N/A'}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="info-card-icon">📅</span>
                  <div>
                    <h4 className="info-card-title">Due Date</h4>
                    <p className="info-card-subtitle">Quote submission deadline</p>
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

          {/* RFQ Items */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">📦</span>
              <h3 className="form-section-title">Requested Items</h3>
            </div>
            
            <DataTable
              data={rfq.items || []}
              columns={itemColumns}
              loading={false}
              emptyMessage="No items found in this RFQ."
            />
          </div>

          {/* Vendor Quotes */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">💰</span>
              <h3 className="form-section-title">Vendor Quotes</h3>
            </div>
            
            <div className="mb-4">
              <Link 
                to={`/rfqs/${rfq.id}/submit-quote`} 
                className="btn btn-primary"
              >
                Submit New Quote (Vendor)
              </Link>
            </div>
            
            <DataTable
              data={quotes}
              columns={quoteColumns}
              loading={false}
              emptyMessage="No vendor quotes received yet."
            />
          </div>

          {/* Quote Approval */}
          {quotes.length > 0 && (
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-icon">✅</span>
                <h3 className="form-section-title">Quote Approval</h3>
              </div>
              
              <div className="action-group">
                <div className="form-group" style={{ marginBottom: 0, minWidth: '300px' }}>
                  <label className="form-label">Select Quote to Approve</label>
                  <select 
                    className="form-input" 
                    value={selectedQuote} 
                    onChange={e => setSelectedQuote(e.target.value)}
                  >
                    <option value="">Select a quote</option>
                    {quotes.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.id.slice(0, 8)} — ₹{parseFloat(q.total || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  className="btn btn-success"
                  disabled={!selectedQuote || approveLoading}
                  onClick={approve}
                >
                  {approveLoading ? 'Creating PO...' : 'Approve & Create PO'}
                </button>
              </div>
            </div>
          )}

          {/* Negotiations */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon">💬</span>
              <h3 className="form-section-title">Negotiations</h3>
            </div>
            
            {negs.length > 0 ? (
              <div className="responsive-grid">
                {negs.map(n => (
                  <div key={n.id} className="info-card">
                    <div className="info-card-header">
                      <span className="info-card-icon">💬</span>
                      <div>
                        <h4 className="info-card-title">{n.created_by}</h4>
                        <p className="info-card-subtitle">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm mb-2">
                      {n.message || 'No message provided'}
                    </div>
                    {n.offered_rate && (
                      <div className="text-sm font-weight-semibold text-primary">
                        Offered Rate: ₹{parseFloat(n.offered_rate).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <div className="empty-state-title">No Negotiations</div>
                <div className="empty-state-description">
                  No negotiations have been added to this RFQ yet.
                </div>
              </div>
            )}
            
            <div className="form-section-header mt-6">
              <span className="form-section-icon">➕</span>
              <h3 className="form-section-title">Add Negotiation</h3>
            </div>
            
            <div className="responsive-grid-sm">
              <div className="form-group">
                <label className="form-label">Comment</label>
                <input 
                  className="form-input" 
                  placeholder="Enter negotiation comment" 
                  value={negMsg} 
                  onChange={e => setNegMsg(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Proposed Rate (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Enter proposed rate" 
                  value={negRate} 
                  onChange={e => setNegRate(e.target.value)} 
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div className="action-group mt-4">
              <button 
                className="btn btn-primary"
                onClick={addNeg}
                disabled={(!negMsg && !negRate) || negLoading}
              >
                {negLoading ? 'Adding...' : 'Add Negotiation'}
              </button>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
}


