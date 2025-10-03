import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompanies } from '../services/companiesService'
import { listPOs } from '../services/purchaseOrdersService'

export default function POList() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { const c = await listCompanies({ limit: 200 }); setCompanies(c.items || []) })() }, [])
  useEffect(() => { (async () => { setLoading(true); setError(''); try { const d = await listPOs({ company_id: companyId || undefined }); setItems(d.items || []) } catch { setError('Failed to load POs') } finally { setLoading(false) } })() }, [companyId])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 24 }}>
      <h3>Purchase Orders</h3>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">All companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Link to="/pos/create">Create from Quote</Link>
      </div>
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">PO Number</th>
            <th align="left">Status</th>
            <th align="left">Total</th>
            <th align="left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{p.po_number}</td>
              <td>{p.status}</td>
              <td>{p.total}</td>
              <td><Link to={`/pos/${p.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


