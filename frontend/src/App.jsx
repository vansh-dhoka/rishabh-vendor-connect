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
    <div>
      <div style={{ padding: '12px 24px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src="/assets/logo.jpeg" 
              alt="Rishabh Vendor Connect" 
              style={{ height: 40, width: 'auto', backgroundColor: 'white', borderRadius: 4 }}
            />
            <div>
              <h1 style={{ margin: 0, color: '#495057' }}>Rishabh Vendor Connect</h1>
              {user && (
                <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>
                  Welcome, {user.name} ({user.role.replace('_', ' ').toUpperCase()})
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user && (
              <div style={{ fontSize: 12, color: '#6c757d', textAlign: 'right' }}>
                <div>{user.email}</div>
                <div>Company: {user.companyId || 'All Companies'}</div>
              </div>
            )}
            <button 
              onClick={logout}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <NavBar />
      </div>
      <Dashboard />
    </div>
  )
}

function Vendors() {
  return <div style={{ padding: 24 }}><h3>Vendors</h3><p>List coming soon.</p></div>
}

function Invoices() {
  async function openPdf() {
    const blob = await apiFetchBlob('/invoices/demo/pdf')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }
  return (
    <div style={{ padding: 24 }}>
      <h3>Invoices</h3>
      <p>Try an invoice PDF (requires auth):</p>
      <button onClick={openPdf}>Open sample PDF</button>
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
          <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
