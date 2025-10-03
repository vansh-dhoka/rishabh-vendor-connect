import api from './apiClient'

export async function listRfqs({ company_id, project_id, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset }
  if (company_id) params.company_id = company_id
  if (project_id) params.project_id = project_id
  const { data } = await api.get('/rfqs', { params })
  return data
}

export async function createRfq(payload) {
  const { data } = await api.post('/rfqs', payload)
  return data
}

export async function getRfq(id) {
  const { data } = await api.get(`/rfqs/${id}`)
  return data
}

export async function listVendorQuotes(rfqId) {
  const { data } = await api.get(`/rfqs/${rfqId}/vendor-quotes`)
  return data
}

export async function submitVendorQuote(rfqId, payload) {
  const { data } = await api.post(`/rfqs/${rfqId}/vendor-quotes`, payload)
  return data
}

export async function listNegotiations(rfqId) {
  const { data } = await api.get(`/rfqs/${rfqId}/negotiations`)
  return data
}

export async function addNegotiation(rfqId, payload) {
  const { data } = await api.post(`/rfqs/${rfqId}/negotiations`, payload)
  return data
}

export async function approveRfq(rfqId, payload) {
  const { data } = await api.post(`/rfqs/${rfqId}/approve`, payload)
  return data
}

import api from './apiClient'

export async function fetchRfqs() {
  const { data } = await api.get('/rfqs')
  return data
}

export async function createRfq(payload) {
  const { data } = await api.post('/rfqs', payload)
  return data
}
