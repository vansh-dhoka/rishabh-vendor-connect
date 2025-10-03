import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardData, getCompanies, getProjects, getVendors } from '../services/dashboardService'
import StatusBadge from '../components/StatusBadge'

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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your vendor management system</p>
      </div>
      
      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-body">
          <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
            Filters
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
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
            <div className="form-group" style={{ marginBottom: 0 }}>
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
            <div className="form-group" style={{ marginBottom: 0 }}>
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
      </div>

      {/* Dashboard Sections */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)'
      }}>
        
        {/* Pending Quotations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-lg)' }}>📋</span>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
                Pending Quotations
              </h3>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: 0 }}>
            {data.pendingQuotes.length === 0 ? (
              <div style={{ 
                padding: 'var(--space-8)', 
                textAlign: 'center',
                color: 'var(--gray-500)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📝</div>
                <p style={{ margin: 0, fontStyle: 'italic' }}>No pending quotations</p>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-4)' }}>
                {data.pendingQuotes.map(quote => (
                  <div key={quote.id} className="card" style={{ 
                    marginBottom: 'var(--space-3)',
                    border: '1px solid var(--gray-200)',
                    backgroundColor: 'var(--gray-50)'
                  }}>
                    <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: '600', 
                        marginBottom: 'var(--space-2)',
                        color: 'var(--gray-800)'
                      }}>
                        {quote.title}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--gray-500)', 
                        marginBottom: 'var(--space-3)',
                        fontFamily: 'monospace'
                      }}>
                        ID: {quote.id.slice(0, 8)} | Project: {quote.project_id ? quote.project_id.slice(0, 8) : 'N/A'}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <StatusBadge status={quote.status} type="quote" />
                        <Link 
                          to={`/rfqs/${quote.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approved POs */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-lg)' }}>✅</span>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
                Approved POs
              </h3>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: 0 }}>
            {data.approvedPOs.length === 0 ? (
              <div style={{ 
                padding: 'var(--space-8)', 
                textAlign: 'center',
                color: 'var(--gray-500)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📄</div>
                <p style={{ margin: 0, fontStyle: 'italic' }}>No approved POs</p>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-4)' }}>
                {data.approvedPOs.map(po => (
                  <div key={po.id} className="card" style={{ 
                    marginBottom: 'var(--space-3)',
                    border: '1px solid var(--gray-200)',
                    backgroundColor: 'var(--gray-50)'
                  }}>
                    <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: '600', 
                        marginBottom: 'var(--space-2)',
                        color: 'var(--gray-800)'
                      }}>
                        {po.po_number}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--gray-500)', 
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'monospace'
                      }}>
                        ID: {po.id.slice(0, 8)} | Project: {po.project_id ? po.project_id.slice(0, 8) : 'N/A'}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--gray-600)', 
                        marginBottom: 'var(--space-3)',
                        fontWeight: '500'
                      }}>
                        Total: ₹{po.total}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <StatusBadge status={po.status} type="po" />
                        <Link 
                          to={`/pos/${po.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoices to Approve */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-lg)' }}>💰</span>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
                Invoices to Approve
              </h3>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: 0 }}>
            {data.invoicesToApprove.length === 0 ? (
              <div style={{ 
                padding: 'var(--space-8)', 
                textAlign: 'center',
                color: 'var(--gray-500)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📊</div>
                <p style={{ margin: 0, fontStyle: 'italic' }}>No invoices to approve</p>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-4)' }}>
                {data.invoicesToApprove.map(invoice => (
                  <div key={invoice.id} className="card" style={{ 
                    marginBottom: 'var(--space-3)',
                    border: '1px solid var(--gray-200)',
                    backgroundColor: 'var(--gray-50)'
                  }}>
                    <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: '600', 
                        marginBottom: 'var(--space-2)',
                        color: 'var(--gray-800)'
                      }}>
                        {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--gray-500)', 
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'monospace'
                      }}>
                        ID: {invoice.id.slice(0, 8)} | PO: {invoice.po_id ? invoice.po_id.slice(0, 8) : 'N/A'}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--gray-600)', 
                        marginBottom: 'var(--space-3)',
                        fontWeight: '500'
                      }}>
                        Total: ₹{invoice.total}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <StatusBadge status={invoice.status} type="invoice" />
                        <Link 
                          to={`/invoices/${invoice.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-lg)' }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
              Quick Actions
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <Link 
              to="/rfqs/compose"
              className="btn btn-primary"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                textDecoration: 'none'
              }}
            >
              <span>📋</span>
              Create RFQ
            </Link>
            <Link 
              to="/pos/create"
              className="btn btn-success"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                textDecoration: 'none'
              }}
            >
              <span>📄</span>
              Create PO
            </Link>
            <Link 
              to="/invoices"
              className="btn btn-secondary"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                textDecoration: 'none'
              }}
            >
              <span>💰</span>
              View All Invoices
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
