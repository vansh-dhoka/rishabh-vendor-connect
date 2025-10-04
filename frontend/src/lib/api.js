import { parseApiError, withErrorHandling } from '../utils/errorHandler.js'

// For production deployment, use the full backend URL
// Force the correct API URL for onrender.com deployments
const API_BASE = (() => {
  let baseUrl = import.meta.env.VITE_API_URL
  
  // If we're on onrender.com, ensure we have the correct backend URL
  if (window.location.hostname.includes('onrender.com')) {
    if (!baseUrl || !baseUrl.includes('rishabh-vendor-connect.onrender.com')) {
      baseUrl = 'https://rishabh-vendor-connect.onrender.com'
    }
  }
  
  // Ensure the URL ends with /api
  if (baseUrl && !baseUrl.endsWith('/api')) {
    baseUrl = baseUrl + '/api'
  }
  
  // If no base URL, use local proxy for development
  return baseUrl || '/api'
})()

// Debug: Log the environment variables
console.log('=== API CONFIGURATION DEBUG ===')
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
  hostname: window.location.hostname,
  isOnRender: window.location.hostname.includes('onrender.com')
})
console.log('Final API_BASE:', API_BASE)
console.log('Current URL:', window.location.href)
console.log('================================')

function getToken() {
  return localStorage.getItem('token')
}

export const apiFetch = withErrorHandling(async (path, options = {}) => {
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
      let errorData
      try {
        errorData = await res.json()
      } catch {
        errorData = { message: await res.text() }
      }
      
      // Create error object that parseApiError can handle
      const error = new Error(errorData.message || `HTTP ${res.status}`)
      error.response = { status: res.status, data: errorData }
      throw error
    }
    
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) return res.json()
    return res.text()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout - please try again')
      timeoutError.type = 'network_error'
      throw timeoutError
    }
    throw error
  }
})

export const login = withErrorHandling(async (email, password) => {
  console.log('Login attempt with API_BASE:', API_BASE)
  console.log('Full URL:', `${API_BASE}/auth/login`)
  
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  
  console.log('Login response:', res)
  if (res?.token) localStorage.setItem('token', res.token)
  return res
})

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


