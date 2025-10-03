import { useEffect, useState } from 'react'
import { fetchProperties } from '../services/propertiesService'

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

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 24 }}>
      <h3>Properties</h3>
      <ul>
        {items.map((p) => (
          <li key={p.id || Math.random()}>{p.name || p.id}</li>
        ))}
      </ul>
    </div>
  )
}
