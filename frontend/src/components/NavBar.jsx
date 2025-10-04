import { Link, useLocation } from 'react-router-dom'
import RoleGuard, { useRoleAccess } from './RoleGuard.jsx'

export default function NavBar() {
  const location = useLocation()
  const { 
    canManageUsers, 
    canManageCompanies, 
    canCreateRFQs, 
    canApprovePOs, 
    canApproveInvoices,
    isVendor,
    isViewer
  } = useRoleAccess()
  
  // Define navigation items with role-based access
  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['all'] },
    { path: '/properties', label: 'Properties', icon: '🏢', roles: ['super_admin', 'company_admin', 'project_manager', 'finance_manager', 'viewer'] },
    { path: '/rfqs', label: 'RFQs', icon: '📋', roles: ['super_admin', 'company_admin', 'project_manager', 'finance_manager', 'vendor', 'viewer'] },
    { path: '/companies', label: 'Companies', icon: '🏭', roles: ['super_admin', 'company_admin', 'viewer'] },
    { path: '/projects', label: 'Projects', icon: '🚧', roles: ['super_admin', 'company_admin', 'project_manager', 'finance_manager', 'vendor', 'viewer'] },
    { path: '/vendors', label: 'Vendors', icon: '🤝', roles: ['super_admin', 'company_admin', 'project_manager', 'finance_manager', 'vendor', 'viewer'] },
    { path: '/items', label: 'Items', icon: '📦', roles: ['super_admin', 'company_admin', 'project_manager', 'finance_manager', 'vendor', 'viewer'] },
    { path: '/pos', label: 'POs', icon: '📄', roles: ['super_admin', 'company_admin', 'project_manager', 'finance_manager', 'vendor', 'viewer'] },
    { path: '/invoices', label: 'Invoices', icon: '💰', roles: ['super_admin', 'company_admin', 'finance_manager', 'vendor', 'viewer'] },
    { path: '/users', label: 'Users', icon: '👥', roles: ['super_admin', 'company_admin'] }
  ]
  
  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => 
    item.roles.includes('all') || 
    item.roles.some(role => {
      switch(role) {
        case 'super_admin': return canManageUsers
        case 'company_admin': return canManageCompanies
        case 'project_manager': return canCreateRFQs
        case 'finance_manager': return canApprovePOs || canApproveInvoices
        case 'vendor': return isVendor
        case 'viewer': return isViewer
        default: return false
      }
    })
  )

  return (
    <nav style={{ 
      padding: '0 var(--space-6)',
      borderBottom: '1px solid var(--gray-200)',
      backgroundColor: 'white'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 'var(--space-8)',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                textDecoration: 'none',
                color: isActive ? 'var(--primary-600)' : 'var(--gray-600)',
                fontWeight: isActive ? '600' : '500',
                fontSize: 'var(--font-size-sm)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.color = 'var(--primary-600)'
                  e.target.style.backgroundColor = 'var(--primary-50)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = 'var(--gray-600)'
                  e.target.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
