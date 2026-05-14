import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <strong>Folio</strong>
      </header>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
