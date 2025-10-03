import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const router = Router()

// User roles and permissions
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin', 
  PROJECT_MANAGER: 'project_manager',
  FINANCE_MANAGER: 'finance_manager',
  VENDOR: 'vendor',
  VIEWER: 'viewer'
}

// Comprehensive user database with different roles
const users = [
  // Super Admin - Full system access
  { 
    id: 'super_admin_1', 
    email: 'superadmin@rishabhvendorconnect.com', 
    passwordHash: bcrypt.hashSync('SuperAdmin@123', 10), 
    companyId: null, // Super admin has access to all companies
    role: USER_ROLES.SUPER_ADMIN,
    name: 'Super Administrator',
    isActive: true
  },
  
  // Company Admins - Full access to their company
  { 
    id: 'company_admin_1', 
    email: 'admin@rishabhdevelopers.com', 
    passwordHash: bcrypt.hashSync('CompanyAdmin@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.COMPANY_ADMIN,
    name: 'Rishabh Developers Admin',
    isActive: true
  },
  { 
    id: 'company_admin_2', 
    email: 'admin@premiumestates.com', 
    passwordHash: bcrypt.hashSync('CompanyAdmin@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.COMPANY_ADMIN,
    name: 'Premium Estates Admin',
    isActive: true
  },
  
  // Project Managers - Manage projects and vendors
  { 
    id: 'project_manager_1', 
    email: 'pm@rishabhdevelopers.com', 
    passwordHash: bcrypt.hashSync('ProjectManager@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.PROJECT_MANAGER,
    name: 'John Smith - Project Manager',
    isActive: true
  },
  { 
    id: 'project_manager_2', 
    email: 'pm@premiumestates.com', 
    passwordHash: bcrypt.hashSync('ProjectManager@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.PROJECT_MANAGER,
    name: 'Sarah Johnson - Project Manager',
    isActive: true
  },
  
  // Finance Managers - Handle POs, invoices, and payments
  { 
    id: 'finance_manager_1', 
    email: 'finance@rishabhdevelopers.com', 
    passwordHash: bcrypt.hashSync('FinanceManager@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.FINANCE_MANAGER,
    name: 'Mike Chen - Finance Manager',
    isActive: true
  },
  { 
    id: 'finance_manager_2', 
    email: 'finance@premiumestates.com', 
    passwordHash: bcrypt.hashSync('FinanceManager@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.FINANCE_MANAGER,
    name: 'Lisa Wang - Finance Manager',
    isActive: true
  },
  
  // Vendors - Submit quotes and manage their profile
  { 
    id: 'vendor_1', 
    email: 'vendor@steelconstruction.com', 
    passwordHash: bcrypt.hashSync('Vendor@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.VENDOR,
    name: 'Steel Construction Co.',
    isActive: true
  },
  { 
    id: 'vendor_2', 
    email: 'vendor@electricalworks.com', 
    passwordHash: bcrypt.hashSync('Vendor@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.VENDOR,
    name: 'Electrical Works Ltd.',
    isActive: true
  },
  { 
    id: 'vendor_3', 
    email: 'vendor@plumbingpro.com', 
    passwordHash: bcrypt.hashSync('Vendor@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.VENDOR,
    name: 'Plumbing Pro Services',
    isActive: true
  },
  
  // Viewers - Read-only access
  { 
    id: 'viewer_1', 
    email: 'viewer@rishabhdevelopers.com', 
    passwordHash: bcrypt.hashSync('Viewer@123', 10), 
    companyId: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
    role: USER_ROLES.VIEWER,
    name: 'Audit Viewer',
    isActive: true
  }
]

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' })
  
  const user = users.find(u => u.email === email && u.isActive)
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })
  
  const ok = bcrypt.compareSync(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  
  const token = jwt.sign({ 
    sub: user.id, 
    companyId: user.companyId, 
    email: user.email,
    role: user.role,
    name: user.name
  }, process.env.JWT_SECRET, { expiresIn: '12h' })
  
  res.json({ 
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    }
  })
})

// Get user profile endpoint
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'token_required' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = users.find(u => u.id === decoded.sub && u.isActive)
    if (!user) return res.status(401).json({ error: 'user_not_found' })
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    })
  } catch (error) {
    res.status(401).json({ error: 'invalid_token' })
  }
})

// Get all users (for admin purposes)
router.get('/users', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'token_required' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = users.find(u => u.id === decoded.sub && u.isActive)
    if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
      return res.status(403).json({ error: 'insufficient_permissions' })
    }
    
    // Return users without password hashes
    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      companyId: u.companyId,
      isActive: u.isActive
    }))
    
    res.json(safeUsers)
  } catch (error) {
    res.status(401).json({ error: 'invalid_token' })
  }
})

export default router


