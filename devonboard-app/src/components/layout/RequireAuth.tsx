import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

/** Blocks the wrapped routes until a user is logged in. */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Blocks the wrapped routes unless the logged-in user is a manager. */
export function RequireManager() {
  const { user } = useAuth()
  if (user?.role !== 'manager') return <Navigate to="/setup" replace />
  return <Outlet />
}
