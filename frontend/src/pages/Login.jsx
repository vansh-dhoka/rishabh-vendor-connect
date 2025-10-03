import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('superadmin@rishabhvendorconnect.com')
  const [password, setPassword] = useState('SuperAdmin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)

  const testCredentials = [
    {
      role: 'Super Admin',
      email: 'superadmin@rishabhvendorconnect.com',
      password: 'SuperAdmin@123',
      icon: '🔑',
      description: 'Full system access'
    },
    {
      role: 'Company Admin',
      email: 'admin@rishabhdevelopers.com',
      password: 'CompanyAdmin@123',
      icon: '🏢',
      description: 'Company management'
    },
    {
      role: 'Project Manager',
      email: 'pm@rishabhdevelopers.com',
      password: 'ProjectManager@123',
      icon: '📋',
      description: 'Project oversight'
    },
    {
      role: 'Finance Manager',
      email: 'finance@rishabhdevelopers.com',
      password: 'FinanceManager@123',
      icon: '💰',
      description: 'Financial operations'
    },
    {
      role: 'Vendor',
      email: 'vendor@steelconstruction.com',
      password: 'Vendor@123',
      icon: '🏗️',
      description: 'Vendor portal access'
    },
    {
      role: 'Viewer',
      email: 'viewer@rishabhdevelopers.com',
      password: 'Viewer@123',
      icon: '👁️',
      description: 'Read-only access'
    }
  ]

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (e) {
      setError('Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  function fillCredentials(credEmail, credPassword) {
    setEmail(credEmail)
    setPassword(credPassword)
    setError('')
  }

  return (
    <div className="app-container" style={{ 
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--gray-50) 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div className="card shadow-xl" style={{ 
        maxWidth: '480px', 
        width: '100%',
        margin: '0 auto'
      }}>
        <div className="card-header text-center">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <img 
              src="/assets/logo.jpeg" 
              alt="Rishabh Vendor Connect" 
              className="logo-large"
              style={{ 
                marginBottom: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div style={{ 
              display: 'none',
              width: '4rem',
              height: '4rem',
              backgroundColor: 'var(--primary-100)',
              borderRadius: 'var(--radius-lg)',
              margin: '0 auto var(--space-4)',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              🏢
            </div>
          </div>
          <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
            Welcome Back
          </h1>
          <p className="text-muted">
            Sign in to Rishabh Vendor Connect
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email"
                className="form-input"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="card-footer">
          <button 
            type="button"
            onClick={() => setShowCredentials(!showCredentials)}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            {showCredentials ? 'Hide' : 'Show'} Test Credentials
          </button>

          {showCredentials && (
            <div style={{ 
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-200)'
            }}>
              <h4 style={{ 
                margin: '0 0 var(--space-4) 0', 
                color: 'var(--gray-700)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '600'
              }}>
                Test User Credentials
              </h4>
              
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {testCredentials.map((cred, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'white',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--gray-200)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => fillCredentials(cred.email, cred.password)}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--primary-300)'
                      e.target.style.backgroundColor = 'var(--primary-50)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--gray-200)'
                      e.target.style.backgroundColor = 'white'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>{cred.icon}</span>
                      <strong style={{ 
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--gray-700)'
                      }}>
                        {cred.role}
                      </strong>
                    </div>
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--gray-500)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {cred.description}
                    </div>
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--gray-600)',
                      fontFamily: 'monospace'
                    }}>
                      {cred.email}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--gray-500)', 
                fontStyle: 'italic',
                marginTop: 'var(--space-3)',
                textAlign: 'center'
              }}>
                Click on any credential to auto-fill the form
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


