import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardData, getCompanies, getProjects, getVendors } from '../services/dashboardService'
import StatusBadge from '../components/StatusBadge'
import PageLayout from '../components/PageLayout'

export default function Dashboard() {
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [vendors, setVendors] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [data, setData] = useState({ pendingQuotes: [], approvedPOs: [], invoicesToApprove: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCompanies() {
      const c = await getCompanies()
      setCompanies(c)
    }
    loadCompanies()
  }, [])

  useEffect(() => {
    async function loadProjects() {
      if (!companyId) { setProjects([]); return }
      const p = await getProjects(companyId)
      setProjects(p)
    }
    loadProjects()
  }, [companyId])

  useEffect(() => {
    async function loadVendors() {
      if (!companyId) { setVendors([]); return }
      const v = await getVendors(companyId)
      setVendors(v)
    }
    loadVendors()
  }, [companyId])

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const d = await getDashboardData({ 
          company_id: companyId || undefined, 
          project_id: projectId || undefined,
          vendor_id: vendorId || undefined
        })
        setData(d)
      } catch (e) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [companyId, projectId, vendorId])

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Overview of your vendor management system"
      loading={loading}
      error={error}
    >
      {/* Filters */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">🔍</span>
          <h3 className="form-section-title">Filters</h3>
        </div>
        
        <div className="responsive-grid-sm">
          <div className="form-group">
            <label className="form-label">Company</label>
            <select 
              className="form-input"
              value={companyId} 
              onChange={e => { setCompanyId(e.target.value); setProjectId(''); setVendorId('') }}
            >
              <option value="">All Companies</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select 
              className="form-input"
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Vendor</label>
            <select 
              className="form-input"
              value={vendorId} 
              onChange={e => setVendorId(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="responsive-grid">
        {/* Pending Quotations */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">📋</span>
            <h3 className="form-section-title">Pending Quotations</h3>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {data.pendingQuotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">No Pending Quotations</div>
                <div className="empty-state-description">
                  All quotations have been processed or no quotations are pending review.
                </div>
              </div>
            ) : (
              <div className="responsive-grid-sm">
                {data.pendingQuotes.map(quote => (
                  <div key={quote.id} className="info-card">
                    <div className="info-card-header">
                      <span className="info-card-icon">📋</span>
                      <div>
                        <h4 className="info-card-title">{quote.title}</h4>
                        <p className="info-card-subtitle">
                          ID: {quote.id.slice(0, 8)} | Project: {quote.project_id ? quote.project_id.slice(0, 8) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <StatusBadge status={quote.status} type="quote" />
                    </div>
                    
                    <div className="action-group">
                      <Link 
                        to={`/rfqs/${quote.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approved POs */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">✅</span>
            <h3 className="form-section-title">Approved Purchase Orders</h3>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {data.approvedPOs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-title">No Approved POs</div>
                <div className="empty-state-description">
                  No purchase orders have been approved yet.
                </div>
              </div>
            ) : (
              <div className="responsive-grid-sm">
                {data.approvedPOs.map(po => (
                  <div key={po.id} className="info-card">
                    <div className="info-card-header">
                      <span className="info-card-icon">📄</span>
                      <div>
                        <h4 className="info-card-title">{po.po_number}</h4>
                        <p className="info-card-subtitle">
                          ID: {po.id.slice(0, 8)} | Project: {po.project_id ? po.project_id.slice(0, 8) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-sm text-muted">Total Amount</div>
                      <div className="text-lg font-weight-semibold text-primary">
                        ₹{parseFloat(po.total || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <StatusBadge status={po.status} type="po" />
                    </div>
                    
                    <div className="action-group">
                      <Link 
                        to={`/pos/${po.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoices to Approve */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">💰</span>
            <h3 className="form-section-title">Invoices to Approve</h3>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {data.invoicesToApprove.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">No Invoices to Approve</div>
                <div className="empty-state-description">
                  All invoices have been processed or no invoices are pending approval.
                </div>
              </div>
            ) : (
              <div className="responsive-grid-sm">
                {data.invoicesToApprove.map(invoice => (
                  <div key={invoice.id} className="info-card">
                    <div className="info-card-header">
                      <span className="info-card-icon">💰</span>
                      <div>
                        <h4 className="info-card-title">
                          {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                        </h4>
                        <p className="info-card-subtitle">
                          ID: {invoice.id.slice(0, 8)} | PO: {invoice.po_id ? invoice.po_id.slice(0, 8) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-sm text-muted">Total Amount</div>
                      <div className="text-lg font-weight-semibold text-primary">
                        ₹{parseFloat(invoice.total || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <StatusBadge status={invoice.status} type="invoice" />
                    </div>
                    
                    <div className="action-group">
                      <Link 
                        to={`/invoices/${invoice.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">⚡</span>
          <h3 className="form-section-title">Quick Actions</h3>
        </div>
        
        <div className="responsive-grid-sm">
          <Link 
            to="/rfqs/compose"
            className="info-card"
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: 'var(--space-6)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <div className="info-card-header" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="info-card-icon" style={{ fontSize: '2rem' }}>📋</span>
              <div>
                <h4 className="info-card-title">Create RFQ</h4>
                <p className="info-card-subtitle">Request quotes from vendors</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Start a new request for quotation to get competitive pricing
            </div>
          </Link>

          <Link 
            to="/pos/create"
            className="info-card"
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: 'var(--space-6)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <div className="info-card-header" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="info-card-icon" style={{ fontSize: '2rem' }}>📄</span>
              <div>
                <h4 className="info-card-title">Create PO</h4>
                <p className="info-card-subtitle">Create purchase order from quote</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Convert approved vendor quotes into purchase orders
            </div>
          </Link>

          <Link 
            to="/invoices"
            className="info-card"
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: 'var(--space-6)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <div className="info-card-header" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="info-card-icon" style={{ fontSize: '2rem' }}>💰</span>
              <div>
                <h4 className="info-card-title">View Invoices</h4>
                <p className="info-card-subtitle">Manage all invoices</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Review, approve, and track all invoice payments
            </div>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
