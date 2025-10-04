import React from 'react'

export default function PageLayout({ 
  title, 
  subtitle, 
  children, 
  actions,
  loading = false,
  error = null 
}) {
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
