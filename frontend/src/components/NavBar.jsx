import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/properties', label: 'Properties', icon: '🏢' },
    { path: '/rfqs', label: 'RFQs', icon: '📋' },
    { path: '/companies', label: 'Companies', icon: '🏭' },
    { path: '/projects', label: 'Projects', icon: '🚧' },
    { path: '/vendors', label: 'Vendors', icon: '🤝' },
    { path: '/items', label: 'Items', icon: '📦' },
    { path: '/pos', label: 'POs', icon: '📄' },
    { path: '/invoices', label: 'Invoices', icon: '💰' },
    { path: '/users', label: 'Users', icon: '👥' }
  ]

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
