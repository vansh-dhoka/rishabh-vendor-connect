import axios from 'axios'

// Use the same API_BASE logic as api.js for consistency
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

// Debug: Log the API configuration
console.log('=== API CLIENT CONFIGURATION ===')
console.log('API_BASE:', API_BASE)
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
  hostname: window.location.hostname,
  isOnRender: window.location.hostname.includes('onrender.com')
})
console.log('================================')

const api = axios.create({
  baseURL: API_BASE
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
