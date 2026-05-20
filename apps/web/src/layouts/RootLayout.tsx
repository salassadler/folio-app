import { useAuth } from '@/hooks/useAuth'
import { Link, Outlet } from 'react-router-dom'

export default function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header
        style={{
          padding: '1rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
          Folio
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
          {isAuthenticated ? (
            <>
              <Link to="/workshops">Workshops</Link>
              <span>{user?.name}</span>
              <button type="button" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
