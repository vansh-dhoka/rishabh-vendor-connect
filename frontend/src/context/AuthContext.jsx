import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, logout as apiLogout } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    async login(email, password) {
      const res = await apiLogin(email, password)
      setToken(res.token)
      setUser(res.user)
      return res
    },
    logout() {
      apiLogout()
      setToken(null)
      setUser(null)
    }
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


