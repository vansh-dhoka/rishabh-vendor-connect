import { useEffect, useMemo, useState } from 'react'
import { createCompany, deleteCompany, listCompanies, updateCompany } from '../services/companiesService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'

function CompanyForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || '')
  const [gstin, setGstin] = useState(initial.gstin || '')
  const [addressLine1, setAddressLine1] = useState(initial.address_line1 || '')
  const [addressLine2, setAddressLine2] = useState(initial.address_line2 || '')
  const [city, setCity] = useState(initial.city || '')
  const [state, setState] = useState(initial.state || '')
  const [postalCode, setPostalCode] = useState(initial.postal_code || '')
  const [country, setCountry] = useState(initial.country || 'IN')
  const [budgetLimit, setBudgetLimit] = useState(initial.budget_limit || '')
  const [error, setError] = useState('')
  const disabled = useMemo(() => name.trim().length === 0, [name])
  
  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
          {initial.id ? 'Edit Company' : 'Add New Company'}
        </h3>
      </div>
      <div className="card-body">
        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          setError(''); 
          if (disabled) { 
            setError('Name is required'); 
            return; 
          } 
          await onSubmit({ 
            name, 
            gstin: gstin || null,
            address_line1: addressLine1 || null,
            address_line2: addressLine2 || null,
            city: city || null,
            state: state || null,
            postal_code: postalCode || null,
            country: country || 'IN',
            budget_limit: budgetLimit || '0.00'
          }) 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Company name" />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input className="form-input" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="GSTIN number" />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input className="form-input" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="Street address" />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input className="form-input" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Apartment, suite, etc." />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={state} onChange={e => setState(e.target.value)} placeholder="State" />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input className="form-input" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Postal code" />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-input" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget Limit (₹)</label>
              <input className="form-input" type="number" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} placeholder="0.00" step="0.01" />
            </div>
          </div>
          {error && <div className="error-message" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={disabled}>Save Company</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
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

  const columns = [
    {
      header: 'Company Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{row.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
            ID: {row.id.slice(0, 8)}
          </div>
        </div>
      )
    },
    {
      header: 'GSTIN',
      key: 'gstin',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', fontFamily: 'monospace', color: 'var(--gray-600)' }}>
          {row.gstin || 'N/A'}
        </div>
      )
    },
    {
      header: 'Address',
      key: 'address',
      render: (row) => (
        <div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
            {row.address_line1 || 'N/A'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
            {row.city && row.state ? `${row.city}, ${row.state}` : 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Budget Limit',
      key: 'budget_limit',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
          ₹{parseFloat(row.budget_limit || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Created',
      key: 'created_at',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={() => setEditing(row)}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={async () => { 
              if (confirm('Are you sure you want to delete this company?')) {
                await deleteCompany(row.id); 
                refresh() 
              }
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title="Companies"
      subtitle="Manage your company database and organizational structure"
      loading={loading}
      error={error}
      actions={
        !adding && !editing && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            Add New Company
          </button>
        )
      }
    >
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
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="No companies found. Add your first company to get started."
      />
    </PageLayout>
  )
}


