import { useEffect, useMemo, useState } from 'react'
import { createCompany, deleteCompany, listCompanies, updateCompany } from '../services/companiesService'

function CompanyForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || '')
  const [gstin, setGstin] = useState(initial.gstin || '')
  const [error, setError] = useState('')
  const disabled = useMemo(() => name.trim().length === 0, [name])
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setError(''); if (disabled) { setError('Name is required'); return; } await onSubmit({ name, gstin: gstin || null }) }}>
      <div>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label>GSTIN</label>
        <input value={gstin} onChange={e => setGstin(e.target.value)} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={disabled}>Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

export default function Companies() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await listCompanies()
      setItems(data.items || [])
    } catch (e) {
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  return (
    <div style={{ padding: 24 }}>
      <h3>Companies</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!adding && !editing && (
        <button onClick={() => setAdding(true)}>Add Company</button>
      )}
      {adding && (
        <CompanyForm
          onSubmit={async (payload) => { await createCompany(payload); setAdding(false); refresh() }}
          onCancel={() => setAdding(false)}
        />
      )}
      {editing && (
        <CompanyForm
          initial={editing}
          onSubmit={async (payload) => { await updateCompany(editing.id, payload); setEditing(null); refresh() }}
          onCancel={() => setEditing(null)}
        />
      )}
      <ul>
        {items.map((c) => (
          <li key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{c.name}</span>
            <small style={{ color: '#666' }}>{c.gstin}</small>
            <button onClick={() => setEditing(c)}>Edit</button>
            <button onClick={async () => { await deleteCompany(c.id); refresh() }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


