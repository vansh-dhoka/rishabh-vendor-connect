import { useEffect, useMemo, useState } from 'react'
import { listRfqs, listVendorQuotes } from '../services/rfqsService'
import { createFromQuote } from '../services/purchaseOrdersService'

export default function POCreateFromQuote() {
  const [rfqs, setRfqs] = useState([])
  const [rfqId, setRfqId] = useState('')
  const [quotes, setQuotes] = useState([])
  const [vendorQuoteId, setVendorQuoteId] = useState('')
  const [taxMode, setTaxMode] = useState('intra')
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')
  const disabled = useMemo(() => !vendorQuoteId, [vendorQuoteId])

  useEffect(() => { (async () => { const r = await listRfqs({ limit: 200 }); setRfqs(r.items || []) })() }, [])
  useEffect(() => { (async () => { if (!rfqId) { setQuotes([]); return } const q = await listVendorQuotes(rfqId); setQuotes(q.items || []) })() }, [rfqId])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    try {
      const po = await createFromQuote({ vendor_quote_id: vendorQuoteId, tax_mode: taxMode })
      setOk(`PO created: ${po.po_number}`)
    } catch (e) {
      setError('Failed to create PO')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h3>Create Purchase Order from Quote</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {ok && <div style={{ color: 'green' }}>{ok}</div>}
      <form onSubmit={submit}>
        <div>
          <label>RFQ</label>
          <select value={rfqId} onChange={e => setRfqId(e.target.value)}>
            <option value="">Select RFQ</option>
            {rfqs.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
        <div>
          <label>Vendor Quote</label>
          <select value={vendorQuoteId} onChange={e => setVendorQuoteId(e.target.value)}>
            <option value="">Select Quote</option>
            {quotes.map(q => <option key={q.id} value={q.id}>{q.id} — {q.total}</option>)}
          </select>
        </div>
        <div>
          <label>Tax Mode</label>
          <select value={taxMode} onChange={e => setTaxMode(e.target.value)}>
            <option value="intra">Intra-state (CGST+SGST)</option>
            <option value="inter">Inter-state (IGST)</option>
          </select>
        </div>
        <button type="submit" disabled={disabled}>Create PO</button>
      </form>
    </div>
  )
}


