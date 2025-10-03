import api from './apiClient'

export async function listCompanies({ limit = 100, offset = 0 } = {}) {
  const { data } = await api.get('/companies', { params: { limit, offset } })
  return data
}

export async function getCompany(id) {
  const { data } = await api.get(`/companies/${id}`)
  return data
}

export async function createCompany(payload) {
  const { data } = await api.post('/companies', payload)
  return data
}

export async function updateCompany(id, payload) {
  const { data } = await api.put(`/companies/${id}`, payload)
  return data
}

export async function deleteCompany(id) {
  await api.delete(`/companies/${id}`)
}


