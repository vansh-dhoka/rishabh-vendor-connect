import { useAuth } from '../context/AuthContext.jsx'

/**
 * RoleGuard component for role-based access control in the UI
 * @param {Object} props
 * @param {string|Array} props.allowedRoles - Single role or array of roles that can access this content
 * @param {string} props.fallback - What to show if user doesn't have access (default: null)
 * @param {boolean} props.invert - If true, show content when user does NOT have the role
 * @param {React.ReactNode} props.children - Content to show if user has access
 */
export default function RoleGuard({ 
  allowedRoles, 
  fallback = null, 
  invert = false, 
  children 
}) {
  const { user } = useAuth()
  
  if (!user) {
    return fallback
  }
  
  const userRole = user.role
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  const hasAccess = roles.includes(userRole)
  const shouldShow = invert ? !hasAccess : hasAccess
  
  return shouldShow ? children : fallback
}

/**
 * Hook for role-based logic in components
 */
export function useRoleAccess() {
  const { user } = useAuth()
  
  if (!user) {
    return {
      isSuperAdmin: false,
      isCompanyAdmin: false,
      isProjectManager: false,
      isFinanceManager: false,
      isVendor: false,
      isViewer: false,
      canManageUsers: false,
      canManageCompanies: false,
      canCreateRFQs: false,
      canApprovePOs: false,
      canApproveInvoices: false,
      canSubmitQuotes: false,
      canViewAllCompanies: false,
      canEditOwnProfile: true,
      hasWriteAccess: false,
      hasReadOnlyAccess: false
    }
  }
  
  const role = user.role
  
  return {
    // Role checks
    isSuperAdmin: role === 'super_admin',
    isCompanyAdmin: role === 'company_admin',
    isProjectManager: role === 'project_manager',
    isFinanceManager: role === 'finance_manager',
    isVendor: role === 'vendor',
    isViewer: role === 'viewer',
    
    // Permission checks
    canManageUsers: ['super_admin', 'company_admin'].includes(role),
    canManageCompanies: ['super_admin', 'company_admin'].includes(role),
    canCreateRFQs: ['super_admin', 'company_admin', 'project_manager'].includes(role),
    canApprovePOs: ['super_admin', 'company_admin', 'finance_manager'].includes(role),
    canApproveInvoices: ['super_admin', 'company_admin', 'finance_manager'].includes(role),
    canSubmitQuotes: ['super_admin', 'company_admin', 'project_manager', 'vendor'].includes(role),
    canViewAllCompanies: role === 'super_admin',
    canEditOwnProfile: true, // Everyone can edit their own profile
    
    // Access level checks
    hasWriteAccess: !['viewer'].includes(role),
    hasReadOnlyAccess: ['viewer'].includes(role)
  }
}

/**
 * Higher-order component for role-based route protection
 */
export function withRoleGuard(WrappedComponent, allowedRoles, fallback = null) {
  return function RoleGuardedComponent(props) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
        <WrappedComponent {...props} />
      </RoleGuard>
    )
  }
}
