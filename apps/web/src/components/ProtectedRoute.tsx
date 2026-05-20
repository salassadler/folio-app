import { useAuthSession } from '@/providers/AuthProvider'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

/** Wrap route branches that require a logged-in user. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthSession()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
