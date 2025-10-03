import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { createItem, deleteItem, listItems, updateItem } from '../services/itemsService'

function ItemForm({ companies, initial = {}, onSubmit, onCancel }) {
  const [companyId, setCompanyId] = useState(initial.company_id || '')
  const [name, setName] = useState(initial.name || '')
  const [unit, setUnit] = useState(initial.unit || 'unit')
  const [hsn, setHsn] = useState(initial.hsn_sac_code || '')
  const [gst, setGst] = useState(initial.gst_rate ?? 0)
  const [price, setPrice] = useState(initial.base_price ?? 0)
  const [error, setError] = useState('')
  const disabled = useMemo(() => !companyId || name.trim().length === 0, [companyId, name])
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setError(''); if (disabled) { setError('Company and name required'); return } await onSubmit({ company_id: companyId, name, unit, hsn_sac_code: hsn, gst_rate: Number(gst), base_price: Number(price) }) }}>
      <div>
        <label>Company</label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
      <div><label>Unit</label><input value={unit} onChange={e => setUnit(e.target.value)} /></div>
      <div><label>HSN/SAC</label><input value={hsn} onChange={e => setHsn(e.target.value)} /></div>
      <div><label>GST %</label><input type="number" step="0.01" value={gst} onChange={e => setGst(e.target.value)} /></div>
      <div><label>Base Price</label><input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={disabled}>Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

export default function Items() {
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
  async function refreshItems() {
    if (!companyId) { setItems([]); return }
    setLoading(true)
    setError('')
    try {
      const data = await listItems({ company_id: companyId })
      setItems(data.items || [])
    } catch (e) {
      setError('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshCompanies() }, [])
  useEffect(() => { refreshItems() }, [companyId])

  return (
    <div style={{ padding: 24 }}>
      <h3>Items / Materials</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Company: </label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!adding && !editing && (
          <button disabled={!companyId} style={{ marginLeft: 12 }} onClick={() => setAdding(true)}>Add Item</button>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {adding && (
        <ItemForm companies={companies} onSubmit={async (payload) => { await createItem(payload); setAdding(false); refreshItems() }} onCancel={() => setAdding(false)} />
      )}
      {editing && (
        <ItemForm companies={companies} initial={editing} onSubmit={async (payload) => { await updateItem(editing.id, payload); setEditing(null); refreshItems() }} onCancel={() => setEditing(null)} />
      )}
      {loading ? <div>Loading...</div> : (
        <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Unit</th>
              <th align="left">HSN/SAC</th>
              <th align="left">GST %</th>
              <th align="left">Base Price</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(v => (
              <tr key={v.id} style={{ borderTop: '1px solid #eee' }}>
                <td>{v.name}</td>
                <td>{v.unit}</td>
                <td>{v.hsn_sac_code}</td>
                <td>{v.gst_rate}</td>
                <td>{v.base_price}</td>
                <td>
                  <button onClick={() => setEditing(v)}>Edit</button>
                  <button onClick={async () => { await deleteItem(v.id); refreshItems() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}


