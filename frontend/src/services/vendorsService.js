import api from './apiClient'

export async function listVendors({ company_id, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset, company_id }
  const { data } = await api.get('/vendors', { params })
  return data
}

export async function createVendor(payload) {
  const { data } = await api.post('/vendors', payload)
  return data
}

export async function updateVendor(id, payload) {
  const { data } = await api.put(`/vendors/${id}`, payload)
  return data
}

export async function deleteVendor(id) {
  await api.delete(`/vendors/${id}`)
}


