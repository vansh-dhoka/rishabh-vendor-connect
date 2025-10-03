export default function StatusBadge({ status, type = 'default' }) {
  const getStatusConfig = () => {
    switch (type) {
      case 'quote':
        return {
          sent: { color: '#fff3cd', textColor: '#856404', label: 'Sent' },
          received: { color: '#d1ecf1', textColor: '#0c5460', label: 'Received' },
          closed: { color: '#d4edda', textColor: '#155724', label: 'Closed' },
          cancelled: { color: '#f8d7da', textColor: '#721c24', label: 'Cancelled' }
        }
      case 'po':
        return {
          draft: { color: '#e2e3e5', textColor: '#383d41', label: 'Draft' },
          issued: { color: '#cce5ff', textColor: '#004085', label: 'Issued' },
          accepted: { color: '#d4edda', textColor: '#155724', label: 'Accepted' },
          partially_received: { color: '#fff3cd', textColor: '#856404', label: 'Partially Received' },
          completed: { color: '#d4edda', textColor: '#155724', label: 'Completed' },
          cancelled: { color: '#f8d7da', textColor: '#721c24', label: 'Cancelled' }
        }
      case 'invoice':
        return {
          draft: { color: '#e2e3e5', textColor: '#383d41', label: 'Draft' },
          submitted: { color: '#fff3cd', textColor: '#856404', label: 'Pending Approval' },
          approved: { color: '#d4edda', textColor: '#155724', label: 'Approved' },
          paid: { color: '#cce5ff', textColor: '#004085', label: 'Paid' },
          rejected: { color: '#f8d7da', textColor: '#721c24', label: 'Rejected' },
          cancelled: { color: '#f8d7da', textColor: '#721c24', label: 'Cancelled' }
        }
      default:
        return {
          [status]: { color: '#e2e3e5', textColor: '#383d41', label: status }
        }
    }
  }

  const config = getStatusConfig()[status] || { color: '#e2e3e5', textColor: '#383d41', label: status }

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: config.color,
      color: config.textColor,
      textTransform: 'capitalize'
    }}>
      {config.label}
    </span>
  )
}
