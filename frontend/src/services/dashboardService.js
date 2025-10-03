import api from './apiClient'

export async function getDashboardData({ company_id, project_id, vendor_id } = {}) {
  const params = {}
  if (company_id) params.company_id = company_id
  if (project_id) params.project_id = project_id
  if (vendor_id) params.vendor_id = vendor_id

  // Fetch all data in parallel
  const [quotes, pos, invoices] = await Promise.all([
    api.get('/rfqs', { params: { ...params, status: 'sent' } }),
    api.get('/purchase-orders', { params: { ...params, status: 'issued' } }),
    api.get('/invoices', { params: { ...params, status: 'submitted' } })
  ])

  return {
    pendingQuotes: quotes.data.items || [],
    approvedPOs: pos.data.items || [],
    invoicesToApprove: invoices.data.items || []
  }
}

export async function getCompanies() {
  const { data } = await api.get('/companies', { params: { limit: 200 } })
  return data.items || []
}

export async function getProjects(companyId) {
  if (!companyId) return []
  const { data } = await api.get('/projects', { params: { company_id: companyId, limit: 200 } })
  return data.items || []
}

export async function getVendors(companyId) {
  if (!companyId) return []
  const { data } = await api.get('/vendors', { params: { company_id: companyId, limit: 200 } })
  return data.items || []
}
