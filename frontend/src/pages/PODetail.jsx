import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPO, updateStatus } from '../services/purchaseOrdersService'

export default function PODetail() {
  const { id } = useParams()
  const [po, setPo] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const d = await getPO(id)
      setPo(d)
      setStatus(d.status)
    } catch (e) {
      setError('Failed to load PO')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [id])

  async function saveStatus() {
    try { const d = await updateStatus(id, status); setPo(d) } catch { alert('Failed to update status') }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>
  if (!po) return null

  return (
    <div style={{ padding: 24 }}>
      <h3>PO {po.po_number}</h3>
      <div>Status: 
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="accepted">Accepted</option>
          <option value="partially_received">Partially Received</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={saveStatus}>Save</button>
      </div>
      <div>Vendor: {po.vendor_id}</div>
      <div>Project: {po.project_id || '-'}</div>
      <div>Subtotal: {po.subtotal} | CGST: {po.tax_cgst} | SGST: {po.tax_sgst} | IGST: {po.tax_igst} | Total: {po.total}</div>
      <h4>Items</h4>
      <table cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Description</th>
            <th align="left">HSN</th>
            <th align="left">GST %</th>
            <th align="left">Qty</th>
            <th align="left">Rate</th>
            <th align="left">Subtotal</th>
            <th align="left">CGST</th>
            <th align="left">SGST</th>
            <th align="left">IGST</th>
            <th align="left">Total</th>
          </tr>
        </thead>
        <tbody>
          {(po.items || []).map(it => (
            <tr key={it.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{it.description}</td>
              <td>{it.hsn_sac_code}</td>
              <td>{it.gst_rate}</td>
              <td>{it.quantity}</td>
              <td>{it.unit_rate}</td>
              <td>{it.line_subtotal}</td>
              <td>{it.tax_cgst}</td>
              <td>{it.tax_sgst}</td>
              <td>{it.tax_igst}</td>
              <td>{it.line_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


