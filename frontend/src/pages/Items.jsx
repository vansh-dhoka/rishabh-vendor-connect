import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { createItem, deleteItem, listItems, updateItem } from '../services/itemsService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'

function ItemForm({ companies, initial = {}, onSubmit, onCancel }) {
  const [companyId, setCompanyId] = useState(initial.company_id || '')
  const [name, setName] = useState(initial.name || '')
  const [unit, setUnit] = useState(initial.unit || 'unit')
  const [hsn, setHsn] = useState(initial.hsn_sac_code || '')
  const [gst, setGst] = useState(initial.gst_rate ?? 0)
  const [price, setPrice] = useState(initial.base_price ?? 0)
  const [description, setDescription] = useState(initial.description || '')
  const [category, setCategory] = useState(initial.category || '')
  const [error, setError] = useState('')
  const disabled = useMemo(() => !companyId || name.trim().length === 0, [companyId, name])
  
  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
          {initial.id ? 'Edit Item' : 'Add New Item'}
        </h3>
      </div>
      <div className="card-body">
        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          setError(''); 
          if (disabled) { 
            setError('Company and name required'); 
            return 
          } 
          await onSubmit({ 
            company_id: companyId, 
            name, 
            unit, 
            hsn_sac_code: hsn, 
            gst_rate: Number(gst), 
            base_price: Number(price),
            description: description || null,
            category: category || null
          }) 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Company *</label>
              <select className="form-input" value={companyId} onChange={e => setCompanyId(e.target.value)}>
                <option value="">Select company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Item name" />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-input" value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="unit">Unit</option>
                <option value="kg">Kilogram</option>
                <option value="ton">Ton</option>
                <option value="m">Meter</option>
                <option value="sqm">Square Meter</option>
                <option value="cbm">Cubic Meter</option>
                <option value="liter">Liter</option>
                <option value="piece">Piece</option>
                <option value="box">Box</option>
                <option value="set">Set</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">HSN/SAC Code</label>
              <input className="form-input" value={hsn} onChange={e => setHsn(e.target.value)} placeholder="HSN/SAC code" />
            </div>
            <div className="form-group">
              <label className="form-label">GST Rate (%)</label>
              <input className="form-input" type="number" step="0.01" min="0" max="100" value={gst} onChange={e => setGst(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Base Price (₹)</label>
              <input className="form-input" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={category} onChange={e => setCategory(e.target.value)} placeholder="Item category" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Item description"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          {error && <div className="error-message" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={disabled}>Save Item</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
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
      header: 'Item Name',
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
      header: 'Category',
      key: 'category',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
          {row.category || 'N/A'}
        </div>
      )
    },
    {
      header: 'Unit',
      key: 'unit',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
          {row.unit}
        </div>
      )
    },
    {
      header: 'HSN/SAC',
      key: 'hsn_sac_code',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', fontFamily: 'monospace', color: 'var(--gray-600)' }}>
          {row.hsn_sac_code || 'N/A'}
        </div>
      )
    },
    {
      header: 'GST Rate',
      key: 'gst_rate',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
          {row.gst_rate}%
        </div>
      )
    },
    {
      header: 'Base Price',
      key: 'base_price',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', fontWeight: '500' }}>
          ₹{parseFloat(row.base_price).toLocaleString()}
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
              if (confirm('Are you sure you want to delete this item?')) {
                await deleteItem(row.id); 
                refreshItems() 
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
      title="Items & Materials"
      subtitle="Manage your item catalog and pricing information"
      loading={loading}
      error={error}
      actions={
        !adding && !editing && (
          <button 
            className="btn btn-primary" 
            disabled={!companyId} 
            onClick={() => setAdding(true)}
          >
            Add New Item
          </button>
        )
      }
    >
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {adding && (
        <ItemForm 
          companies={companies} 
          onSubmit={async (payload) => { 
            await createItem(payload); 
            setAdding(false); 
            refreshItems() 
          }} 
          onCancel={() => setAdding(false)} 
        />
      )}
      
      {editing && (
        <ItemForm 
          companies={companies} 
          initial={editing} 
          onSubmit={async (payload) => { 
            await updateItem(editing.id, payload); 
            setEditing(null); 
            refreshItems() 
          }} 
          onCancel={() => setEditing(null)} 
        />
      )}
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage={companyId ? "No items found for this company. Add your first item to get started." : "Select a company to view items."}
      />
    </PageLayout>
  )
}


