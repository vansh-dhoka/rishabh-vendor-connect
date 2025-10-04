import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompanies } from '../services/companiesService'
import { listProjects } from '../services/projectsService'
import { listRfqs } from '../services/rfqsService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'
import StatusBadge from '../components/StatusBadge'

export default function Rfqs() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { const c = await listCompanies({ limit: 200 }); setCompanies(c.items || []) })() }, [])
  useEffect(() => { (async () => { if (!companyId) { setProjects([]); return } const p = await listProjects({ company_id: companyId }); setProjects(p.items || []) })() }, [companyId])
  useEffect(() => { (async () => {
    setLoading(true); setError('')
    try { const data = await listRfqs({ company_id: companyId || undefined, project_id: projectId || undefined }); setItems(data.items || []) }
    catch { setError('Failed to load RFQs') }
    finally { setLoading(false) }
  })() }, [companyId, projectId])

  const filters = [
    {
      key: 'companyId',
      label: 'Company',
      type: 'select',
      value: companyId,
      options: companies.map(c => ({ value: c.id, label: c.name }))
    },
    {
      key: 'projectId',
      label: 'Project',
      type: 'select',
      value: projectId,
      options: projects.map(p => ({ value: p.id, label: p.name }))
    }
  ]

  const handleFilterChange = (key, value) => {
    if (key === 'companyId') {
      setCompanyId(value)
      setProjectId('')
    } else if (key === 'projectId') {
      setProjectId(value)
    }
  }

  const columns = [
    {
      header: 'Title',
      key: 'title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{row.title}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
            ID: {row.id.slice(0, 8)}
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => (
        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.description || 'No description'}
        </div>
      )
    },
    {
      header: 'Project',
      key: 'project_id',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: 'var(--gray-500)' }}>
          {row.project_id ? row.project_id.slice(0, 8) : 'N/A'}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} type="quote" />
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
        <Link to={`/rfqs/${row.id}`} className="btn btn-sm btn-primary">
          View Details
        </Link>
      )
    }
  ]

  return (
    <PageLayout
      title="Request for Quotations (RFQs)"
      subtitle="Manage and track all your RFQ requests"
      loading={loading}
      error={error}
      actions={
        <Link to="/rfqs/compose" className="btn btn-primary">
          Create New RFQ
        </Link>
      }
    >
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="No RFQs found. Create your first RFQ to get started."
      />
    </PageLayout>
  )
}
