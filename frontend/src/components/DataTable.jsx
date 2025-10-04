import React from 'react'
import { Link } from 'react-router-dom'

export default function DataTable({ 
  data = [], 
  columns = [], 
  loading = false,
  emptyMessage = "No data available",
  onRowClick = null
}) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p className="text-muted">{emptyMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    style={{
                      padding: 'var(--space-4)',
                      textAlign: column.align || 'left',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      color: 'var(--gray-700)',
                      borderBottom: '1px solid var(--gray-200)'
                    }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  style={{
                    borderBottom: '1px solid var(--gray-100)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => onRowClick && onRowClick(row)}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.target.closest('tr').style.backgroundColor = 'var(--gray-50)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.target.closest('tr').style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        padding: 'var(--space-4)',
                        textAlign: column.align || 'left',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--gray-600)',
                        borderBottom: '1px solid var(--gray-100)'
                      }}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
