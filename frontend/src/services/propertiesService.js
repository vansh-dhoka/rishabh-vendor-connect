import api from './apiClient'

export async function fetchProperties() {
  const { data } = await api.get('/properties')
  return data
}

export async function createProperty(payload) {
  const { data } = await api.post('/properties', payload)
  return data
}
