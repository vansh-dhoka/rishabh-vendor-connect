import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { createVendor, deleteVendor, listVendors, updateVendor } from '../services/vendorsService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'

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
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
          {initial.id ? 'Edit Vendor' : 'Add New Vendor'}
        </h3>
      </div>
      <div className="card-body">
        <form onSubmit={async (e) => { e.preventDefault(); setError(''); if (disabled) { setError('Company and name required'); return } await onSubmit({ company_id: companyId, name, gstin, pan, bank_name: bankName, bank_account: bankAccount, ifsc_code: ifsc, email, phone }) }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Company *</label>
              <select className="form-input" value={companyId} onChange={e => setCompanyId(e.target.value)}>
                <option value="">Select company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Vendor name" />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input className="form-input" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="GSTIN number" />
            </div>
            <div className="form-group">
              <label className="form-label">PAN</label>
              <input className="form-input" value={pan} onChange={e => setPan(e.target.value)} placeholder="PAN number" />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input className="form-input" placeholder="Bank name" value={bankName} onChange={e => setBankName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input className="form-input" placeholder="Account number" value={bankAccount} onChange={e => setBankAccount(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input className="form-input" value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="IFSC code" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
          </div>
          {error && <div className="error-message" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={disabled}>Save Vendor</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
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

  const filters = [
    {
      key: 'companyId',
      label: 'Company',
      type: 'select',
      value: companyId,
      options: companies.map(c => ({ value: c.id, label: c.name }))
    }
  ]

  const handleFilterChange = (key, value) => {
    if (key === 'companyId') {
      setCompanyId(value)
    }
  }

  const columns = [
    {
      header: 'Name',
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
      header: 'PAN',
      key: 'pan',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', fontFamily: 'monospace', color: 'var(--gray-600)' }}>
          {row.pan || 'N/A'}
        </div>
      )
    },
    {
      header: 'Contact',
      key: 'contact',
      render: (row) => (
        <div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>{row.email || 'N/A'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>{row.phone || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Bank Details',
      key: 'bank',
      render: (row) => (
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>{row.bank_name || 'N/A'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
            {row.bank_account ? `****${row.bank_account.slice(-4)}` : 'N/A'}
          </div>
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
              if (confirm('Are you sure you want to delete this vendor?')) {
                await deleteVendor(row.id); 
                refreshVendors() 
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
      title="Vendors"
      subtitle="Manage your vendor database and contact information"
      loading={loading}
      error={error}
      actions={
        !adding && !editing && (
          <button 
            className="btn btn-primary" 
            disabled={!companyId} 
            onClick={() => setAdding(true)}
          >
            Add New Vendor
          </button>
        )
      }
    >
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {adding && (
        <VendorForm 
          companies={companies} 
          onSubmit={async (payload) => { 
            await createVendor(payload); 
            setAdding(false); 
            refreshVendors() 
          }} 
          onCancel={() => setAdding(false)} 
        />
      )}
      
      {editing && (
        <VendorForm 
          companies={companies} 
          initial={editing} 
          onSubmit={async (payload) => { 
            await updateVendor(editing.id, payload); 
            setEditing(null); 
            refreshVendors() 
          }} 
          onCancel={() => setEditing(null)} 
        />
      )}
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage={companyId ? "No vendors found for this company. Add your first vendor to get started." : "Select a company to view vendors."}
      />
    </PageLayout>
  )
}


