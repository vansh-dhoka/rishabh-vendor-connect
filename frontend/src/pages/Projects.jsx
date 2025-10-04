import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { createProject, deleteProject, listProjects, updateProject } from '../services/projectsService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'
import FilterBar from '../components/FilterBar'
import StatusBadge from '../components/StatusBadge'

function ProjectForm({ companies, initial = {}, onSubmit, onCancel }) {
  const [companyId, setCompanyId] = useState(initial.company_id || '')
  const [name, setName] = useState(initial.name || '')
  const [status, setStatus] = useState(initial.status || 'planned')
  const [description, setDescription] = useState(initial.description || '')
  const [startDate, setStartDate] = useState(initial.start_date || '')
  const [endDate, setEndDate] = useState(initial.end_date || '')
  const [budget, setBudget] = useState(initial.budget || '')
  const [error, setError] = useState('')
  const disabled = useMemo(() => !companyId || name.trim().length === 0, [companyId, name])
  
  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--gray-700)' }}>
          {initial.id ? 'Edit Project' : 'Add New Project'}
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
            status,
            description: description || null,
            start_date: startDate || null,
            end_date: endDate || null,
            budget: budget || null
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
              <label className="form-label">Project Name *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget (₹)</label>
              <input className="form-input" type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Project description"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          {error && <div className="error-message" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={disabled}>Save Project</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
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
  async function refreshProjects() {
    setLoading(true)
    setError('')
    try {
      const data = await listProjects({ company_id: companyId || undefined })
      setItems(data.items || [])
    } catch (e) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshCompanies() }, [])
  useEffect(() => { refreshProjects() }, [companyId])

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
      header: 'Project Name',
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
      header: 'Company',
      key: 'company_id',
      render: (row) => {
        const company = companies.find(c => c.id === row.company_id)
        return (
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
            {company ? company.name : 'N/A'}
          </div>
        )
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} type="project" />
    },
    {
      header: 'Budget',
      key: 'budget',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
          {row.budget ? `₹${parseFloat(row.budget).toLocaleString()}` : 'N/A'}
        </div>
      )
    },
    {
      header: 'Duration',
      key: 'duration',
      render: (row) => (
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
            {row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
            {row.end_date ? new Date(row.end_date).toLocaleDateString() : 'N/A'}
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
              if (confirm('Are you sure you want to delete this project?')) {
                await deleteProject(row.id); 
                refreshProjects() 
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
      title="Projects"
      subtitle="Manage your project portfolio and track progress"
      loading={loading}
      error={error}
      actions={
        !adding && !editing && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            Add New Project
          </button>
        )
      }
    >
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {adding && (
        <ProjectForm 
          companies={companies} 
          onSubmit={async (payload) => { 
            await createProject(payload); 
            setAdding(false); 
            refreshProjects() 
          }} 
          onCancel={() => setAdding(false)} 
        />
      )}
      
      {editing && (
        <ProjectForm 
          companies={companies} 
          initial={editing} 
          onSubmit={async (payload) => { 
            await updateProject(editing.id, payload); 
            setEditing(null); 
            refreshProjects() 
          }} 
          onCancel={() => setEditing(null)} 
        />
      )}
      
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="No projects found. Add your first project to get started."
      />
    </PageLayout>
  )
}


