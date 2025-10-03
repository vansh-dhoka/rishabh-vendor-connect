import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { createVendor, deleteVendor, listVendors, updateVendor } from '../services/vendorsService'

function VendorForm({ companies, initial = {}, onSubmit, onCancel }) {
  const [companyId, setCompanyId] = useState(initial.company_id || '')
  const [name, setName] = useState(initial.name || '')
  const [gstin, setGstin] = useState(initial.gstin || '')
  const [pan, setPan] = useState(initial.pan || '')
  const [bankName, setBankName] = useState(initial.bank_name || '')
  const [bankAccount, setBankAccount] = useState(initial.bank_account || '')
  const [ifsc, setIfsc] = useState(initial.ifsc_code || '')
  const [email, setEmail] = useState(initial.email || '')
  const [phone, setPhone] = useState(initial.phone || '')
  const [error, setError] = useState('')
  const disabled = useMemo(() => !companyId || name.trim().length === 0, [companyId, name])
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setError(''); if (disabled) { setError('Company and name required'); return } await onSubmit({ company_id: companyId, name, gstin, pan, bank_name: bankName, bank_account: bankAccount, ifsc_code: ifsc, email, phone }) }}>
      <div>
        <label>Company</label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
      <div><label>GSTIN</label><input value={gstin} onChange={e => setGstin(e.target.value)} /></div>
      <div><label>PAN</label><input value={pan} onChange={e => setPan(e.target.value)} /></div>
      <div><label>Bank</label><input placeholder="Bank name" value={bankName} onChange={e => setBankName(e.target.value)} /></div>
      <div><label>Account</label><input placeholder="Account number" value={bankAccount} onChange={e => setBankAccount(e.target.value)} /></div>
      <div><label>IFSC</label><input value={ifsc} onChange={e => setIfsc(e.target.value)} /></div>
      <div><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><label>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={disabled}>Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

export default function Vendors() {
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
  async function refreshVendors() {
    if (!companyId) { setItems([]); return }
    setLoading(true)
    setError('')
    try {
      const data = await listVendors({ company_id: companyId })
      setItems(data.items || [])
    } catch (e) {
      setError('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshCompanies() }, [])
  useEffect(() => { refreshVendors() }, [companyId])

  return (
    <div style={{ padding: 24 }}>
      <h3>Vendors</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Company: </label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!adding && !editing && (
          <button disabled={!companyId} style={{ marginLeft: 12 }} onClick={() => setAdding(true)}>Add Vendor</button>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {adding && (
        <VendorForm companies={companies} onSubmit={async (payload) => { await createVendor(payload); setAdding(false); refreshVendors() }} onCancel={() => setAdding(false)} />
      )}
      {editing && (
        <VendorForm companies={companies} initial={editing} onSubmit={async (payload) => { await updateVendor(editing.id, payload); setEditing(null); refreshVendors() }} onCancel={() => setEditing(null)} />
      )}
      {loading ? <div>Loading...</div> : (
        <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">GSTIN</th>
              <th align="left">PAN</th>
              <th align="left">Email</th>
              <th align="left">Phone</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(v => (
              <tr key={v.id} style={{ borderTop: '1px solid #eee' }}>
                <td>{v.name}</td>
                <td>{v.gstin}</td>
                <td>{v.pan}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>
                  <button onClick={() => setEditing(v)}>Edit</button>
                  <button onClick={async () => { await deleteVendor(v.id); refreshVendors() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}


