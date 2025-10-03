import api from './apiClient'

export async function listProjects({ company_id, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset }
  if (company_id) params.company_id = company_id
  const { data } = await api.get('/projects', { params })
  return data
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export async function createProject(payload) {
  const { data } = await api.post('/projects', payload)
  return data
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/projects/${id}`, payload)
  return data
}

export async function deleteProject(id) {
  await api.delete(`/projects/${id}`)
}


