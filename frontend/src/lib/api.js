// For production deployment, use the full backend URL
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://rishabh-vendor-connect.onrender.com/api' : '/api')

// Debug: Log the environment variables
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
})
console.log('Final API_BASE:', API_BASE)

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
  console.log('Login attempt with API_BASE:', API_BASE)
  console.log('Full URL:', `${API_BASE}/auth/login`)
  
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  console.log('Login response:', res)
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


