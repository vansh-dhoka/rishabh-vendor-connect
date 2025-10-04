import { useEffect, useState } from 'react'
import { fetchProperties } from '../services/propertiesService'
import PageLayout from '../components/PageLayout'
import DataTable from '../components/DataTable'

export default function Properties() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchProperties()
        setItems(data.items || [])
      } catch (e) {
        setError('Failed to load properties')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    {
      header: 'Property Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{row.name || 'Unnamed Property'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
            ID: {row.id.slice(0, 8)}
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
          {row.type || 'N/A'}
        </div>
      )
    },
    {
      header: 'Location',
      key: 'location',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
          {row.location || 'N/A'}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
          {row.status || 'N/A'}
        </div>
      )
    },
    {
      header: 'Created',
      key: 'created_at',
      render: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title="Properties"
      subtitle="Manage your property portfolio and real estate assets"
      loading={loading}
      error={error}
    >
      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="No properties found. Properties will appear here when they are added to the system."
      />
    </PageLayout>
  )
}
