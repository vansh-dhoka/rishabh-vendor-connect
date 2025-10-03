import api from './apiClient'

export async function listPOs({ company_id, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset }
  if (company_id) params.company_id = company_id
  const { data } = await api.get('/purchase-orders', { params })
  return data
}

export async function getPO(id) {
  const { data } = await api.get(`/purchase-orders/${id}`)
  return data
}

export async function createFromQuote(payload) {
  const { data } = await api.post('/purchase-orders/from-quote', payload)
  return data
}

export async function updateStatus(id, status) {
  const { data } = await api.patch(`/purchase-orders/${id}/status`, { status })
  return data
}


