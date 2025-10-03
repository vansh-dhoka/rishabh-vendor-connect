import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompanies } from '../services/companiesService'
import { listProjects } from '../services/projectsService'
import { listRfqs } from '../services/rfqsService'

export default function Rfqs() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { const c = await listCompanies({ limit: 200 }); setCompanies(c.items || []) })() }, [])
  useEffect(() => { (async () => { if (!companyId) { setProjects([]); return } const p = await listProjects({ company_id: companyId }); setProjects(p.items || []) })() }, [companyId])
  useEffect(() => { (async () => {
    setLoading(true); setError('')
    try { const data = await listRfqs({ company_id: companyId || undefined, project_id: projectId || undefined }); setItems(data.items || []) }
    catch { setError('Failed to load RFQs') }
    finally { setLoading(false) }
  })() }, [companyId, projectId])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 24 }}>
      <h3>RFQs</h3>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">All companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Link to="/rfqs/compose">Create RFQ</Link>
      </div>
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Title</th>
            <th align="left">Status</th>
            <th align="left">Due</th>
            <th align="left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id || Math.random()} style={{ borderTop: '1px solid #eee' }}>
              <td>{p.title}</td>
              <td>{p.status}</td>
              <td>{p.due_date || '-'}</td>
              <td><Link to={`/rfqs/${p.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
