import { trpc } from '@/lib/trpc'
import { Link } from 'react-router-dom'

export function WorkshopsPage() {
  const { data: workshops, isLoading, error } = trpc.workshop.listWorkshops.useQuery()

  if (isLoading) {
    return <p>Loading workshops…</p>
  }

  if (error) {
    return <p role="alert">Could not load workshops: {error.message}</p>
  }

  if (!workshops?.length) {
    return (
      <div>
        <h1>Your workshops</h1>
        <p style={{ color: '#666' }}>You are not in any workshops yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Your workshops</h1>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {workshops.map((workshop) => (
          <li
            key={workshop.id}
            style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee' }}
          >
            <strong>{workshop.name}</strong>
            <span style={{ color: '#888', marginLeft: '0.5rem' }}>/{workshop.slug}</span>
            {workshop.description && (
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.875rem' }}>
                {workshop.description}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <Link to="/">Back to home</Link>
      </p>
    </div>
  )
}
