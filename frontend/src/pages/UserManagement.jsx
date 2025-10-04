import { useState, useEffect } from 'react'
import apiClient from '../services/apiClient.js'
import PageLayout from '../components/PageLayout'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/auth/users')
      setUsers(response.data)
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    const icons = {
      super_admin: '🔑',
      company_admin: '🏢',
      project_manager: '📋',
      finance_manager: '💰',
      vendor: '🏗️',
      viewer: '👁️'
    }
    return icons[role] || '👤'
  }

  const getRoleColor = (role) => {
    const colors = {
      super_admin: '#dc3545',
      company_admin: '#007bff',
      project_manager: '#28a745',
      finance_manager: '#ffc107',
      vendor: '#6f42c1',
      viewer: '#6c757d'
    }
    return colors[role] || '#6c757d'
  }

  const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <PageLayout
      title="User Management"
      subtitle="Manage system users and their access permissions"
      loading={loading}
      error={error}
      actions={
        <button 
          className="btn btn-primary"
          onClick={fetchUsers}
        >
          Refresh Users
        </button>
      }
    >
      {/* Role Information */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">👥</span>
          <h3 className="form-section-title">User Roles & Permissions</h3>
        </div>
        
        <div className="responsive-grid-sm">
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🔑</span>
              <div>
                <h4 className="info-card-title">Super Admin</h4>
                <p className="info-card-subtitle">Full system access</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Complete system control, user management, and administrative functions
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🏢</span>
              <div>
                <h4 className="info-card-title">Company Admin</h4>
                <p className="info-card-subtitle">Company management</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Full access to assigned company data and operations
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">📋</span>
              <div>
                <h4 className="info-card-title">Project Manager</h4>
                <p className="info-card-subtitle">Project oversight</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Manage projects, RFQs, and vendor relationships
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">💰</span>
              <div>
                <h4 className="info-card-title">Finance Manager</h4>
                <p className="info-card-subtitle">Financial operations</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Handle purchase orders, invoices, and payment processing
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🏗️</span>
              <div>
                <h4 className="info-card-title">Vendor</h4>
                <p className="info-card-subtitle">Vendor portal access</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              Submit quotes and manage vendor profile information
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">👁️</span>
              <div>
                <h4 className="info-card-title">Viewer</h4>
                <p className="info-card-subtitle">Read-only access</p>
              </div>
            </div>
            <div className="text-sm text-muted">
              View company data and reports without modification rights
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">👤</span>
          <h3 className="form-section-title">System Users</h3>
        </div>
        
        <div className="responsive-grid">
          {users.map(user => (
            <div key={user.id} className="info-card">
              <div className="info-card-header">
                <span className="info-card-icon">{getRoleIcon(user.role)}</span>
                <div>
                  <h4 className="info-card-title">{user.name}</h4>
                  <p className="info-card-subtitle" style={{ color: getRoleColor(user.role) }}>
                    {formatRole(user.role)}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm mb-2">
                  <span className="font-weight-medium">Email:</span>
                  <div className="text-muted">{user.email}</div>
                </div>
                <div className="text-sm mb-2">
                  <span className="font-weight-medium">Company:</span>
                  <div className="text-muted">{user.companyId || 'All Companies'}</div>
                </div>
                <div className="text-sm mb-2">
                  <span className="font-weight-medium">Status:</span>
                  <div>
                    <span 
                      className="status-container"
                      style={{
                        backgroundColor: user.isActive ? 'var(--success-100)' : 'var(--danger-100)',
                        color: user.isActive ? 'var(--success-700)' : 'var(--danger-700)'
                      }}
                    >
                      <span 
                        className="status-dot"
                        style={{
                          backgroundColor: user.isActive ? 'var(--success-500)' : 'var(--danger-500)'
                        }}
                      ></span>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted p-2" style={{ 
                backgroundColor: 'var(--gray-50)', 
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace'
              }}>
                ID: {user.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Login Credentials */}
      <div className="form-section">
        <div className="form-section-header">
          <span className="form-section-icon">🔐</span>
          <h3 className="form-section-title">Quick Login Credentials</h3>
        </div>
        
        <div className="responsive-grid-sm">
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🔑</span>
              <div>
                <h4 className="info-card-title">Super Admin</h4>
                <p className="info-card-subtitle">Full system access</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-weight-medium mb-1">Email:</div>
              <div className="text-muted font-mono mb-2">superadmin@rishabhvendorconnect.com</div>
              <div className="font-weight-medium mb-1">Password:</div>
              <div className="text-muted font-mono">SuperAdmin@123</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🏢</span>
              <div>
                <h4 className="info-card-title">Company Admin</h4>
                <p className="info-card-subtitle">Company management</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-weight-medium mb-1">Email:</div>
              <div className="text-muted font-mono mb-2">admin@rishabhdevelopers.com</div>
              <div className="font-weight-medium mb-1">Password:</div>
              <div className="text-muted font-mono">CompanyAdmin@123</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">📋</span>
              <div>
                <h4 className="info-card-title">Project Manager</h4>
                <p className="info-card-subtitle">Project oversight</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-weight-medium mb-1">Email:</div>
              <div className="text-muted font-mono mb-2">pm@rishabhdevelopers.com</div>
              <div className="font-weight-medium mb-1">Password:</div>
              <div className="text-muted font-mono">ProjectManager@123</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">💰</span>
              <div>
                <h4 className="info-card-title">Finance Manager</h4>
                <p className="info-card-subtitle">Financial operations</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-weight-medium mb-1">Email:</div>
              <div className="text-muted font-mono mb-2">finance@rishabhdevelopers.com</div>
              <div className="font-weight-medium mb-1">Password:</div>
              <div className="text-muted font-mono">FinanceManager@123</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🏗️</span>
              <div>
                <h4 className="info-card-title">Vendor</h4>
                <p className="info-card-subtitle">Vendor portal access</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-weight-medium mb-1">Email:</div>
              <div className="text-muted font-mono mb-2">vendor@steelconstruction.com</div>
              <div className="font-weight-medium mb-1">Password:</div>
              <div className="text-muted font-mono">Vendor@123</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">👁️</span>
              <div>
                <h4 className="info-card-title">Viewer</h4>
                <p className="info-card-subtitle">Read-only access</p>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-weight-medium mb-1">Email:</div>
              <div className="text-muted font-mono mb-2">viewer@rishabhdevelopers.com</div>
              <div className="font-weight-medium mb-1">Password:</div>
              <div className="text-muted font-mono">Viewer@123</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
