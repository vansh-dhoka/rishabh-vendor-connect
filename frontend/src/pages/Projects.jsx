import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { createProject, deleteProject, listProjects, updateProject } from '../services/projectsService'

function ProjectForm({ companies, initial = {}, onSubmit, onCancel }) {
  const [companyId, setCompanyId] = useState(initial.company_id || '')
  const [name, setName] = useState(initial.name || '')
  const [status, setStatus] = useState(initial.status || 'planned')
  const [error, setError] = useState('')
  const disabled = useMemo(() => !companyId || name.trim().length === 0, [companyId, name])
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setError(''); if (disabled) { setError('Company and name required'); return } await onSubmit({ company_id: companyId, name, status }) }}>
      <div>
        <label>Company</label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={disabled}>Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

export default function Projects() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)

  async function refreshCompanies() {
    const data = await listCompanies({ limit: 100 })
    setCompanies(data.items || [])
  }
  async function refreshProjects() {
    setLoading(true)
    setError('')
    try {
      const data = await listProjects({ company_id: companyId || undefined })
      setItems(data.items || [])
    } catch (e) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshCompanies() }, [])
  useEffect(() => { refreshProjects() }, [companyId])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  return (
    <div style={{ padding: 24 }}>
      <h3>Projects</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <label>Filter by company: </label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">All companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!adding && !editing && (
          <button style={{ marginLeft: 12 }} onClick={() => setAdding(true)}>Add Project</button>
        )}
      </div>
      {adding && (
        <ProjectForm companies={companies} onSubmit={async (payload) => { await createProject(payload); setAdding(false); refreshProjects() }} onCancel={() => setAdding(false)} />
      )}
      {editing && (
        <ProjectForm companies={companies} initial={editing} onSubmit={async (payload) => { await updateProject(editing.id, payload); setEditing(null); refreshProjects() }} onCancel={() => setEditing(null)} />
      )}
      <ul>
        {items.map((p) => (
          <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{p.name}</span>
            <small style={{ color: '#666' }}>{p.status}</small>
            <button onClick={() => setEditing(p)}>Edit</button>
            <button onClick={async () => { await deleteProject(p.id); refreshProjects() }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


