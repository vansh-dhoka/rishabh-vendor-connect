import { useEffect, useMemo, useState } from 'react'
import { listCompanies } from '../services/companiesService'
import { listProjects } from '../services/projectsService'
import { createRfq } from '../services/rfqsService'
import PageLayout from '../components/PageLayout'

export default function RfqCompose() {
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState([{ description: '', quantity: 1, target_rate: 0 }])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)
  const disabled = useMemo(() => !companyId || title.trim().length === 0, [companyId, title])

  useEffect(() => {
    async function init() {
      const c = await listCompanies({ limit: 200 })
      setCompanies(c.items || [])
    }
    init()
  }, [])

  useEffect(() => {
    async function loadProjects() {
      if (!companyId) { setProjects([]); return }
      const p = await listProjects({ company_id: companyId, limit: 200 })
      setProjects(p.items || [])
    }
    loadProjects()
  }, [companyId])

  function updateItem(idx, field, value) {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: value }
    setItems(next)
  }

  function addItem() {
    setItems([...items, { description: '', quantity: 1, target_rate: 0 }])
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      const payload = {
        company_id: companyId,
        project_id: projectId || null,
        title,
        description,
        due_date: dueDate || null,
        items: items.map(i => ({ description: i.description, quantity: Number(i.quantity || 1), target_rate: Number(i.target_rate || 0) }))
      }
      await createRfq(payload)
      setOk('RFQ created successfully!')
      setTitle('')
      setDescription('')
      setDueDate('')
      setItems([{ description: '', quantity: 1, target_rate: 0 }])
    } catch (e) {
      setError('Failed to create RFQ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      title="Create Request for Quotation"
      subtitle="Create a new RFQ to request quotes from vendors"
    >
      {error && <div className="error-message">{error}</div>}
      {ok && <div className="success-message">{ok}</div>}
      
      <form onSubmit={submit}>
        {/* Basic Information */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">📋</span>
            <h3 className="form-section-title">Basic Information</h3>
          </div>
          
          <div className="responsive-grid-sm">
            <div className="form-group">
              <label className="form-label">Company *</label>
              <select 
                className="form-input" 
                value={companyId} 
                onChange={e => setCompanyId(e.target.value)}
                required
              >
                <option value="">Select company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Project</label>
              <select 
                className="form-input" 
                value={projectId} 
                onChange={e => setProjectId(e.target.value)}
              >
                <option value="">(Optional) Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input 
                className="form-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Enter RFQ title"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Enter detailed description of requirements"
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon">📦</span>
            <h3 className="form-section-title">Items & Requirements</h3>
          </div>
          
          <div className="table-container">
            <div className="table-header">
              <h4 className="table-title">RFQ Items</h4>
              <p className="table-subtitle">Add items you need quotes for</p>
            </div>
            
            <div className="p-4">
              {items.map((item, idx) => (
                <div key={idx} className="responsive-grid-sm mb-4 p-4" style={{ 
                  border: '1px solid var(--gray-200)', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--gray-50)'
                }}>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input 
                      className="form-input" 
                      placeholder="Item description" 
                      value={item.description} 
                      onChange={e => updateItem(idx, 'description', e.target.value)} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="Quantity" 
                      value={item.quantity} 
                      onChange={e => updateItem(idx, 'quantity', e.target.value)} 
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Target Rate (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="Expected rate" 
                      value={item.target_rate} 
                      onChange={e => updateItem(idx, 'target_rate', e.target.value)} 
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="text-center">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={addItem}
                >
                  + Add Another Item
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="form-section">
          <div className="action-group">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={disabled || loading}
            >
              {loading ? 'Creating RFQ...' : 'Create RFQ'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setTitle('')
                setDescription('')
                setDueDate('')
                setItems([{ description: '', quantity: 1, target_rate: 0 }])
                setError('')
                setOk('')
              }}
            >
              Reset Form
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  )
}


