import api from './apiClient'

export async function listItems({ company_id, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset, company_id }
  const { data } = await api.get('/items', { params })
  return data
}

export async function createItem(payload) {
  const { data } = await api.post('/items', payload)
  return data
}

export async function updateItem(id, payload) {
  const { data } = await api.put(`/items/${id}`, payload)
  return data
}

export async function deleteItem(id) {
  await api.delete(`/items/${id}`)
}


