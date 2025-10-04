import React from 'react'

export default function FilterBar({ filters = [], onFilterChange }) {
  if (!filters || filters.length === 0) return null

  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-body">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--space-4)',
          alignItems: 'end'
        }}>
          {filters.map((filter, index) => (
            <div key={index} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{filter.label}</label>
              {filter.type === 'select' ? (
                <select
                  className="form-input"
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                >
                  <option value="">All {filter.label}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type || 'text'}
                  className="form-input"
                  placeholder={filter.placeholder}
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
