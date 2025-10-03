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

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      
      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24, 
        padding: 16, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8 
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: '500' }}>Company</label>
          <select 
            value={companyId} 
            onChange={e => { setCompanyId(e.target.value); setProjectId(''); setVendorId('') }}
            style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: '500' }}>Project</label>
          <select 
            value={projectId} 
            onChange={e => setProjectId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: '500' }}>Vendor</label>
          <select 
            value={vendorId} 
            onChange={e => setVendorId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
          >
            <option value="">All Vendors</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        
        {/* Pending Quotations */}
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>Pending Quotations</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {data.pendingQuotes.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No pending quotations</p>
            ) : (
              data.pendingQuotes.map(quote => (
                <div key={quote.id} style={{ 
                  padding: 12, 
                  border: '1px solid #e9ecef', 
                  borderRadius: 6, 
                  marginBottom: 8,
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: 4 }}>
                    {quote.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 8 }}>
                    ID: {quote.id.slice(0, 8)} | Project: {quote.project_id ? quote.project_id.slice(0, 8) : 'N/A'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={quote.status} type="quote" />
                    <Link 
                      to={`/rfqs/${quote.id}`}
                      style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none' }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Approved POs */}
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>Approved POs</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {data.approvedPOs.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No approved POs</p>
            ) : (
              data.approvedPOs.map(po => (
                <div key={po.id} style={{ 
                  padding: 12, 
                  border: '1px solid #e9ecef', 
                  borderRadius: 6, 
                  marginBottom: 8,
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: 4 }}>
                    {po.po_number}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 8 }}>
                    ID: {po.id.slice(0, 8)} | Project: {po.project_id ? po.project_id.slice(0, 8) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 8 }}>
                    Total: ₹{po.total}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={po.status} type="po" />
                    <Link 
                      to={`/pos/${po.id}`}
                      style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none' }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoices to Approve */}
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>Invoices to Approve</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {data.invoicesToApprove.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No invoices to approve</p>
            ) : (
              data.invoicesToApprove.map(invoice => (
                <div key={invoice.id} style={{ 
                  padding: 12, 
                  border: '1px solid #e9ecef', 
                  borderRadius: 6, 
                  marginBottom: 8,
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: 4 }}>
                    {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 8 }}>
                    ID: {invoice.id.slice(0, 8)} | PO: {invoice.po_id ? invoice.po_id.slice(0, 8) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 8 }}>
                    Total: ₹{invoice.total}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={invoice.status} type="invoice" />
                    <Link 
                      to={`/invoices/${invoice.id}`}
                      style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none' }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 32, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link 
            to="/rfqs/compose"
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Create RFQ
          </Link>
          <Link 
            to="/pos/create"
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Create PO
          </Link>
          <Link 
            to="/invoices"
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View All Invoices
          </Link>
        </div>
      </div>
    </div>
  )
}
