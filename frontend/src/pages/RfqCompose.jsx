import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { listProjects } from '../services/projectsService'
import { createRfq } from '../services/rfqsService'

export default function RfqCompose() {
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState([{ description: '', quantity: 1, target_rate: 0 }])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const disabled = useMemo(() => !companyId || title.trim().length === 0, [companyId, title])

  useEffect(() => {
    async function init() {
      const c = await listCompanies({ limit: 200 })
      setCompanies(c.items || [])
    }
    init()
  }, [])

  useEffect(() => {
    async function loadProjects() {
      if (!companyId) { setProjects([]); return }
      const p = await listProjects({ company_id: companyId, limit: 200 })
      setProjects(p.items || [])
    }
    loadProjects()
  }, [companyId])

  function updateItem(idx, field, value) {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: value }
    setItems(next)
  }

  function addItem() {
    setItems([...items, { description: '', quantity: 1, target_rate: 0 }])
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    try {
      const payload = {
        company_id: companyId,
        project_id: projectId || null,
        title,
        description,
        due_date: dueDate || null,
        items: items.map(i => ({ description: i.description, quantity: Number(i.quantity || 1), target_rate: Number(i.target_rate || 0) }))
      }
      await createRfq(payload)
      setOk('RFQ created')
      setTitle('')
      setDescription('')
      setDueDate('')
      setItems([{ description: '', quantity: 1, target_rate: 0 }])
    } catch (e) {
      setError('Failed to create RFQ')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h3>Create Quotation Request</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {ok && <div style={{ color: 'green' }}>{ok}</div>}
      <form onSubmit={submit}>
        <div>
          <label>Company</label>
          <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
            <option value="">Select company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label>Project</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">(Optional) Select project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label>Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        <div style={{ marginTop: 12 }}>
          <h4>Items</h4>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input placeholder="Description" value={it.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
              <input type="number" placeholder="Qty" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
              <input type="number" placeholder="Target rate" value={it.target_rate} onChange={e => updateItem(idx, 'target_rate', e.target.value)} />
              <button type="button" onClick={() => removeItem(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addItem}>Add Item</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={disabled}>Create RFQ</button>
        </div>
      </form>
    </div>
  )
}


