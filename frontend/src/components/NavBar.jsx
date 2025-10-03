import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 24, 
      padding: 16, 
      borderBottom: '1px solid #eee',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img 
          src="/assets/logo.jpeg" 
          alt="Rishabh Vendor Connect" 
          style={{ height: 40, width: 'auto', backgroundColor: 'white', borderRadius: 4 }}
        />
        <span style={{ fontSize: 20, fontWeight: 'bold', color: '#2c3e50' }}>
          Rishabh Vendor Connect
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Dashboard</Link>
        <Link to="/properties" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Properties</Link>
        <Link to="/rfqs" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>RFQs</Link>
        <Link to="/companies" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Companies</Link>
        <Link to="/projects" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Projects</Link>
        <Link to="/vendors" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Vendors</Link>
        <Link to="/items" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Items</Link>
        <Link to="/pos" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>POs</Link>
        <Link to="/invoices" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Invoices</Link>
        <Link to="/users" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Users</Link>
      </div>
    </nav>
  )
}
