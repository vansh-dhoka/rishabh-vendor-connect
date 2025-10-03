import api from './apiClient'

export async function listInvoices({ company_id, po_id, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset }
  if (company_id) params.company_id = company_id
  if (po_id) params.po_id = po_id
  const { data } = await api.get('/invoices', { params })
  return data
}

export async function getInvoice(id) {
  const { data } = await api.get(`/invoices/${id}`)
  return data
}

export async function createFromPO(payload) {
  const { data } = await api.post('/invoices/from-po', payload)
  return data
}

export async function updateStatus(id, status) {
  const { data } = await api.patch(`/invoices/${id}/status`, { status })
  return data
}

export async function generatePDF(id) {
  const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
  return response.data
}

export async function uploadInvoice(id, file) {
  const formData = new FormData()
  formData.append('invoice', file)
  const { data } = await api.post(`/invoices/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
