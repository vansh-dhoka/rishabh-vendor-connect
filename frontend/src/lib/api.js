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
  
  // Add timeout and better error handling
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { 
      ...options, 
      headers,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`API Error ${res.status}:`, errorText)
      throw new Error(`API ${res.status}: ${errorText}`)
    }
    
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) return res.json()
    return res.text()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again')
    }
    console.error('Fetch error:', error)
    throw new Error(`Network error: ${error.message}`)
  }
}

export async function login(email, password) {
  console.log('Login attempt with API_BASE:', API_BASE)
  console.log('Full URL:', `${API_BASE}/auth/login`)
  
  // Retry logic for login
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Login attempt ${attempt}/3`)
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      console.log('Login response:', res)
      if (res?.token) localStorage.setItem('token', res.token)
      return res
    } catch (error) {
      lastError = error
      console.error(`Login attempt ${attempt} failed:`, error.message)
      if (attempt < 3) {
        console.log(`Retrying in ${attempt * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }
  }
  throw lastError
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


