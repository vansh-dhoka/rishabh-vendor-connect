const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export async function login(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  if (res?.token) localStorage.setItem('token', res.token)
  return res
}

export function logout() {
  localStorage.removeItem('token')
}

export async function apiFetchBlob(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return await res.blob()
}


