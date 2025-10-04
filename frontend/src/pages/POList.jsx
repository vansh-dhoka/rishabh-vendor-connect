import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompanies } from '../services/companiesService'
import { listPOs } from '../services/purchaseOrdersService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'
import StatusBadge from '../components/StatusBadge'

export default function POList() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { const c = await listCompanies({ limit: 200 }); setCompanies(c.items || []) })() }, [])
  useEffect(() => { (async () => { setLoading(true); setError(''); try { const d = await listPOs({ company_id: companyId || undefined }); setItems(d.items || []) } catch { setError('Failed to load POs') } finally { setLoading(false) } })() }, [companyId])

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
      header: 'PO Number',
      key: 'po_number',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{row.po_number}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
            ID: {row.id.slice(0, 8)}
          </div>
        </div>
      )
    },
    {
      header: 'RFQ Reference',
      key: 'rfq_id',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: 'var(--gray-500)' }}>
          {row.rfq_id ? row.rfq_id.slice(0, 8) : 'N/A'}
        </div>
      )
    },
    {
      header: 'Amount',
      key: 'total',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>
            ₹{parseFloat(row.total).toLocaleString()}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
            {row.currency || 'INR'}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} type="po" />
    },
    {
      header: 'Issue Date',
      key: 'issue_date',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
          {row.issue_date ? new Date(row.issue_date).toLocaleDateString() : 'N/A'}
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
        <Link to={`/pos/${row.id}`} className="btn btn-sm btn-primary">
          View Details
        </Link>
      )
    }
  ]

  return (
    <PageLayout
      title="Purchase Orders"
      subtitle="Manage and track all your purchase orders"
      loading={loading}
      error={error}
      actions={
        <Link to="/pos/create" className="btn btn-primary">
          Create from Quote
        </Link>
      }
    >
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="No purchase orders found. Create your first PO to get started."
      />
    </PageLayout>
  )
}


