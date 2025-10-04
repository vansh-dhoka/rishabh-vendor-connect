import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing_token' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (_e) {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' })
    if (Array.isArray(roles) && roles.length > 0) {
      if (!roles.includes(req.user.role || 'user')) {
        return res.status(403).json({ error: 'forbidden' })
      }
    }
    next()
  }
}

// Enforce that any provided company_id matches the authenticated user's company
export function enforceCompanyScope(req, res, next) {
  const userCompanyId = req.user?.companyId
  const userRole = req.user?.role
  
  // Super admin can access all companies
  if (userRole === 'super_admin') {
    req.scope = { company_id: null } // No company restriction for super admin
    return next()
  }
  
  if (!userCompanyId) return res.status(401).json({ error: 'unauthenticated' })

  const bodyCompany = req.body?.company_id
  const queryCompany = req.query?.company_id

  // If company_id is explicitly provided, it must match
  if (bodyCompany && bodyCompany !== userCompanyId) {
    return res.status(403).json({ error: 'company_scope_violation' })
  }
  if (queryCompany && queryCompany !== userCompanyId) {
    return res.status(403).json({ error: 'company_scope_violation' })
  }

  // Optionally inject scope for downstream queries
  req.scope = { company_id: userCompanyId }
  next()
}


