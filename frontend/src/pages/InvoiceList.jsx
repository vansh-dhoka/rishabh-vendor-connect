import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompanies } from '../services/companiesService'
import { listProjects } from '../services/projectsService'
import { listInvoices } from '../services/invoicesService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'
import StatusBadge from '../components/StatusBadge'

export default function InvoiceList() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { const c = await listCompanies({ limit: 200 }); setCompanies(c.items || []) })() }, [])
  useEffect(() => { (async () => { if (!companyId) { setProjects([]); return } const p = await listProjects({ company_id: companyId }); setProjects(p.items || []) })() }, [companyId])
  useEffect(() => { (async () => { setLoading(true); setError(''); try { const d = await listInvoices({ company_id: companyId || undefined }); setItems(d.items || []) } catch { setError('Failed to load invoices') } finally { setLoading(false) } })() }, [companyId])

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
      header: 'Invoice Number',
      key: 'invoice_number',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>
            {row.invoice_number || `INV-${row.id.slice(0, 8)}`}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
            ID: {row.id.slice(0, 8)}
          </div>
        </div>
      )
    },
    {
      header: 'PO Reference',
      key: 'po_id',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: 'var(--gray-500)' }}>
          {row.po_id ? row.po_id.slice(0, 8) : 'N/A'}
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
      render: (row) => <StatusBadge status={row.status} type="invoice" />
    },
    {
      header: 'Due Date',
      key: 'due_date',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
          {row.due_date ? new Date(row.due_date).toLocaleDateString() : 'N/A'}
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
        <Link to={`/invoices/${row.id}`} className="btn btn-sm btn-primary">
          View Details
        </Link>
      )
    }
  ]

  return (
    <PageLayout
      title="Invoices"
      subtitle="Manage and track all your invoices"
      loading={loading}
      error={error}
      actions={
        <Link to="/invoices/create" className="btn btn-primary">
          Create New Invoice
        </Link>
      }
    >
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="No invoices found. Create your first invoice to get started."
      />
    </PageLayout>
  )
}
