import { Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
import { obtenerSesion } from '../services/session'

/**
 * Wraps protected routes and redirects to the login page if not logged in.
 * Also blocks non-admin users from accessing admin routes.
 */
export default function ProtectedRoute({
  children,
  needAdmin = false
}) {
  // Fetch session
  const sesion = obtenerSesion()
  const isAdmin = sesion?.rol === 1

  // If no session, redirect to login
  if (!sesion) {
    return <Navigate to="/" replace />
  }

  // Check for admin user
  if (needAdmin && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  // Everything is fine, render outlet
  return children ?? <Outlet />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  needAdmin: PropTypes.bool,
}
