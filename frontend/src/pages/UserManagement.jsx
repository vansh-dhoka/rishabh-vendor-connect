import { useState, useEffect } from 'react'
import { apiClient } from '../services/apiClient.js'

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

  if (loading) return <div style={{ padding: 20 }}>Loading users...</div>
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>User Management</h2>
        <button 
          onClick={fetchUsers}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        fontSize: 14
      }}>
        <strong>User Roles & Permissions:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: 20 }}>
          <li><strong>🔑 Super Admin:</strong> Full system access, user management</li>
          <li><strong>🏢 Company Admin:</strong> Full access to assigned company</li>
          <li><strong>📋 Project Manager:</strong> Manage projects, RFQs, and vendors</li>
          <li><strong>💰 Finance Manager:</strong> Handle POs, invoices, and payments</li>
          <li><strong>🏗️ Vendor:</strong> Submit quotes and manage profile</li>
          <li><strong>👁️ Viewer:</strong> Read-only access to company data</li>
        </ul>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: 15,
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
      }}>
        {users.map(user => (
          <div 
            key={user.id}
            style={{
              border: '1px solid #dee2e6',
              borderRadius: 8,
              padding: 15,
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{getRoleIcon(user.role)}</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{user.name}</div>
                <div style={{ 
                  fontSize: 12, 
                  color: getRoleColor(user.role),
                  fontWeight: 'bold'
                }}>
                  {formatRole(user.role)}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, color: '#6c757d' }}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={{ fontSize: 14, color: '#6c757d' }}>
                <strong>Company:</strong> {user.companyId || 'All Companies'}
              </div>
              <div style={{ fontSize: 14, color: '#6c757d' }}>
                <strong>Status:</strong> 
                <span style={{ 
                  color: user.isActive ? '#28a745' : '#dc3545',
                  fontWeight: 'bold',
                  marginLeft: 5
                }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div style={{ 
              fontSize: 12, 
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
              padding: 8,
              borderRadius: 4
            }}>
              <strong>User ID:</strong> {user.id}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: 30, 
        padding: 20, 
        backgroundColor: '#e9ecef', 
        borderRadius: 8,
        fontSize: 14
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Quick Login Credentials</h3>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div>
            <strong>🔑 Super Admin:</strong><br/>
            superadmin@rishabhvendorconnect.com<br/>
            <code>SuperAdmin@123</code>
          </div>
          <div>
            <strong>🏢 Company Admin:</strong><br/>
            admin@rishabhdevelopers.com<br/>
            <code>CompanyAdmin@123</code>
          </div>
          <div>
            <strong>📋 Project Manager:</strong><br/>
            pm@rishabhdevelopers.com<br/>
            <code>ProjectManager@123</code>
          </div>
          <div>
            <strong>💰 Finance Manager:</strong><br/>
            finance@rishabhdevelopers.com<br/>
            <code>FinanceManager@123</code>
          </div>
          <div>
            <strong>🏗️ Vendor:</strong><br/>
            vendor@steelconstruction.com<br/>
            <code>Vendor@123</code>
          </div>
          <div>
            <strong>👁️ Viewer:</strong><br/>
            viewer@rishabhdevelopers.com<br/>
            <code>Viewer@123</code>
          </div>
        </div>
      </div>
    </div>
  )
}
