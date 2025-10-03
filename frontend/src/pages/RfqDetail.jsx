import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addNegotiation, approveRfq, getRfq, listNegotiations, listVendorQuotes } from '../services/rfqsService'

export default function RfqDetail() {
  const { id } = useParams()
  const [rfq, setRfq] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [negs, setNegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approveLoading, setApproveLoading] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState('')
  const [negMsg, setNegMsg] = useState('')
  const [negRate, setNegRate] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const d = await getRfq(id)
      setRfq(d)
      const q = await listVendorQuotes(id)
      setQuotes(q.items || [])
      const n = await listNegotiations(id)
      setNegs(n.items || [])
    } catch (e) {
      setError('Failed to load RFQ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [id])

  async function addNeg() {
    if (!negMsg && !negRate) return
    await addNegotiation(id, { message: negMsg || null, offered_rate: negRate ? Number(negRate) : null, created_by: 'developer' })
    setNegMsg('')
    setNegRate('')
    const n = await listNegotiations(id)
    setNegs(n.items || [])
  }

  async function approve() {
    if (!selectedQuote) return
    setApproveLoading(true)
    try {
      await approveRfq(id, { vendor_quote_id: selectedQuote })
      await refresh()
      alert('PO created from selected quote')
    } catch (e) {
      alert('Approval failed')
    } finally {
      setApproveLoading(false)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>
  if (!rfq) return null

  return (
    <div style={{ padding: 24 }}>
      <h3>RFQ Detail</h3>
      <div>
        <strong>{rfq.title}</strong>
        <div>Status: {rfq.status}</div>
        <div>Project: {rfq.project_id || '-'}</div>
        <div>Due: {rfq.due_date || '-'}</div>
      </div>
      <h4 style={{ marginTop: 16 }}>Items</h4>
      <ul>
        {(rfq.items || []).map((it, i) => (
          <li key={i}>{it.description} — Qty {it.quantity} — Target {it.target_rate}</li>
        ))}
      </ul>

      <h4 style={{ marginTop: 16 }}>Vendor Quotes</h4>
      <div style={{ marginBottom: 8 }}>
        <Link to={`/rfqs/${rfq.id}/submit-quote`}>Submit Quote (Vendor)</Link>
      </div>
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Quote ID</th>
            <th align="left">Vendor</th>
            <th align="left">Status</th>
            <th align="left">Total</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => (
            <tr key={q.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{q.id}</td>
              <td>{q.vendor_id}</td>
              <td>{q.status}</td>
              <td>{q.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <label>Select quote to approve: </label>
        <select value={selectedQuote} onChange={e => setSelectedQuote(e.target.value)}>
          <option value="">Select</option>
          {quotes.map(q => <option key={q.id} value={q.id}>{q.id} — {q.total}</option>)}
        </select>
        <button disabled={!selectedQuote || approveLoading} onClick={approve}>Approve & Create PO</button>
      </div>

      <h4 style={{ marginTop: 16 }}>Negotiations</h4>
      <ul>
        {negs.map(n => (
          <li key={n.id}>{n.created_at} — {n.created_by}: {n.message} {n.offered_rate ? `(rate: ${n.offered_rate})` : ''}</li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Comment" value={negMsg} onChange={e => setNegMsg(e.target.value)} />
        <input placeholder="Proposed rate" type="number" value={negRate} onChange={e => setNegRate(e.target.value)} />
        <button onClick={addNeg}>Add negotiation</button>
      </div>
    </div>
  )
}


