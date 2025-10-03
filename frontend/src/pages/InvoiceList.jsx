import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompanies } from '../services/companiesService'
import { listProjects } from '../services/projectsService'
import { listInvoices } from '../services/invoicesService'

export default function InvoiceList() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { const c = await listCompanies({ limit: 200 }); setCompanies(c.items || []) })() }, [])
  useEffect(() => { (async () => { if (!companyId) { setProjects([]); return } const p = await listProjects({ company_id: companyId }); setProjects(p.items || []) })() }, [companyId])
  useEffect(() => { (async () => { setLoading(true); setError(''); try { const d = await listInvoices({ company_id: companyId || undefined }); setItems(d.items || []) } catch { setError('Failed to load invoices') } finally { setLoading(false) } })() }, [companyId])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 24 }}>
      <h3>Invoices</h3>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">All companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Invoice #</th>
            <th align="left">Status</th>
            <th align="left">Date</th>
            <th align="left">Total</th>
            <th align="left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{p.invoice_number || p.id.slice(0, 8)}</td>
              <td>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  backgroundColor: p.status === 'approved' ? '#d4edda' : 
                                 p.status === 'paid' ? '#cce5ff' :
                                 p.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                  color: p.status === 'approved' ? '#155724' :
                        p.status === 'paid' ? '#004085' :
                        p.status === 'rejected' ? '#721c24' : '#856404'
                }}>
                  {p.status}
                </span>
              </td>
              <td>{p.invoice_date || '-'}</td>
              <td>{p.total}</td>
              <td><Link to={`/invoices/${p.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
