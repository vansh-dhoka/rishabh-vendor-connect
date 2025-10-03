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

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (e) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '80px auto', 
      padding: 40, 
      backgroundColor: '#ffffff',
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <img 
          src="/assets/logo.jpeg" 
          alt="Rishabh Vendor Connect" 
          style={{ height: 60, width: 'auto', backgroundColor: 'white', borderRadius: 8, marginBottom: 16 }}
        />
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Rishabh Vendor Connect</h2>
        <p style={{ margin: '8px 0 0 0', color: '#6c757d' }}>Vendor Portal Login</p>
      </div>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button disabled={loading} type="submit">{loading ? '...' : 'Login'}</button>
      </form>
      
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button 
          type="button"
          onClick={() => setShowCredentials(!showCredentials)}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: 14
          }}
        >
          {showCredentials ? 'Hide' : 'Show'} Test Credentials
        </button>
      </div>

      {showCredentials && (
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          fontSize: 12,
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Test User Credentials:</h4>
          
          <div style={{ marginBottom: 15 }}>
            <strong>🔑 Super Admin:</strong><br/>
            Email: superadmin@rishabhvendorconnect.com<br/>
            Password: SuperAdmin@123
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong>🏢 Company Admin:</strong><br/>
            Email: admin@rishabhdevelopers.com<br/>
            Password: CompanyAdmin@123
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong>📋 Project Manager:</strong><br/>
            Email: pm@rishabhdevelopers.com<br/>
            Password: ProjectManager@123
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong>💰 Finance Manager:</strong><br/>
            Email: finance@rishabhdevelopers.com<br/>
            Password: FinanceManager@123
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong>🏗️ Vendor:</strong><br/>
            Email: vendor@steelconstruction.com<br/>
            Password: Vendor@123
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <strong>👁️ Viewer:</strong><br/>
            Email: viewer@rishabhdevelopers.com<br/>
            Password: Viewer@123
          </div>
          
          <div style={{ fontSize: 11, color: '#6c757d', fontStyle: 'italic' }}>
            Click on any credential to auto-fill the form
          </div>
        </div>
      )}
    </div>
  )
}


