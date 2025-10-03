import axios from 'axios'

// Import the API_BASE from our main api.js file
// This ensures we use the same dynamic URL resolution logic
const getApiBase = () => {
  // If we're on onrender.com, use the full backend URL
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://rishabh-vendor-connect.onrender.com/api'
  }
  
  // For development, use the proxy
  return '/api'
}

const api = axios.create({
  baseURL: getApiBase()
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
