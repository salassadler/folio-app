import { trpc } from '@/lib/trpc'

export function HomePage() {
  const health = trpc.ping.useQuery()

  return (
    <div>
      <h1>Folio</h1>
      <p>A literary workshop and publishing platform.</p>
      <p style={{ color: '#888', fontSize: '0.875rem' }}>
        API: {health.isLoading ? 'connecting…' : (health.data?.status ?? 'error')}
      </p>
    </div>
  )
}
