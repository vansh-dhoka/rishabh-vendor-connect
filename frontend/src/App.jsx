import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import { apiFetchBlob } from './lib/api.js'
import NavBar from './components/NavBar.jsx'
import Properties from './pages/Properties.jsx'
import Rfqs from './pages/Rfqs.jsx'
import Companies from './pages/Companies.jsx'
import Projects from './pages/Projects.jsx'
import Vendors from './pages/Vendors.jsx'
import Items from './pages/Items.jsx'
import RfqCompose from './pages/RfqCompose.jsx'
import RfqDetail from './pages/RfqDetail.jsx'
import VendorQuote from './pages/VendorQuote.jsx'
import POList from './pages/POList.jsx'
import POCreateFromQuote from './pages/POCreateFromQuote.jsx'
import PODetail from './pages/PODetail.jsx'
import InvoiceList from './pages/InvoiceList.jsx'
import InvoiceDetail from './pages/InvoiceDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import UserManagement from './pages/UserManagement.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function DashboardWrapper() {
  const { logout, user } = useAuth()
  return (
    <div className="app-container">
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-brand">
            <img 
              src="/assets/logo.jpeg" 
              alt="Rishabh Vendor Connect" 
              className="logo"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div style={{ 
              display: 'none',
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'var(--primary-100)',
              borderRadius: 'var(--radius-md)',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              🏢
            </div>
            <div>
              <div className="nav-title">Rishabh Vendor Connect</div>
              {user && (
                <div className="nav-subtitle">
                  Welcome, {user.name} ({user.role.replace('_', ' ').toUpperCase()})
                </div>
              )}
            </div>
          </div>
          
          <div className="nav-user-info">
            {user && (
              <div className="nav-user-details">
                <div className="nav-user-name">{user.name}</div>
                <div className="nav-user-email">{user.email}</div>
                <div className="nav-user-company">
                  Company: {user.companyId || 'All Companies'}
                </div>
              </div>
            )}
            <button 
              onClick={logout}
              className="btn btn-danger btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
        <NavBar />
      </div>
      
      <div className="main-content">
        <Dashboard />
      </div>
    </div>
  )
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
          <Route path="/rfqs" element={<ProtectedRoute><Rfqs /></ProtectedRoute>} />
          <Route path="/rfqs/compose" element={<ProtectedRoute><RfqCompose /></ProtectedRoute>} />
          <Route path="/rfqs/:id" element={<ProtectedRoute><RfqDetail /></ProtectedRoute>} />
          <Route path="/rfqs/:id/submit-quote" element={<ProtectedRoute><VendorQuote /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POList /></ProtectedRoute>} />
          <Route path="/pos/create" element={<ProtectedRoute><POCreateFromQuote /></ProtectedRoute>} />
          <Route path="/pos/:id" element={<ProtectedRoute><PODetail /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
