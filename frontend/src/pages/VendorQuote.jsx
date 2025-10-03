import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRfq, submitVendorQuote } from '../services/rfqsService'
import { listVendors } from '../services/vendorsService'

export default function VendorQuote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rfq, setRfq] = useState(null)
  const [vendors, setVendors] = useState([])
  const [vendorId, setVendorId] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    async function init() {
      const d = await getRfq(id)
      setRfq(d)
      setItems((d.items || []).map(i => ({ rfq_item_id: i.id, description: i.description, quantity: i.quantity, unit_rate: i.target_rate })))
    }
    init()
  }, [id])

  useEffect(() => {
    async function loadVendors() {
      if (!rfq?.company_id) return
      const v = await listVendors({ company_id: rfq.company_id })
      setVendors(v.items || [])
    }
    loadVendors()
  }, [rfq?.company_id])

  function updateItem(idx, field, value) {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: value }
    setItems(next)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    try {
      await submitVendorQuote(id, { vendor_id: vendorId, items: items.map(i => ({ rfq_item_id: i.rfq_item_id, description: i.description, quantity: Number(i.quantity || 1), unit_rate: Number(i.unit_rate || 0) })) })
      setOk('Quote submitted')
      setTimeout(() => navigate(`/rfqs/${id}`), 800)
    } catch (e) {
      setError('Failed to submit quote')
    }
  }

  if (!rfq) return <div style={{ padding: 24 }}>Loading...</div>
  return (
    <div style={{ padding: 24 }}>
      <h3>Submit Quote for RFQ</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {ok && <div style={{ color: 'green' }}>{ok}</div>}
      <form onSubmit={submit}>
        <div>
          <label>Vendor</label>
          <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
            <option value="">Select vendor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <h4>Items</h4>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <input placeholder="Description" value={it.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
            <input type="number" placeholder="Qty" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
            <input type="number" placeholder="Unit rate" value={it.unit_rate} onChange={e => updateItem(idx, 'unit_rate', e.target.value)} />
          </div>
        ))}
        <button disabled={!vendorId} type="submit">Submit Quote</button>
      </form>
    </div>
  )
}


