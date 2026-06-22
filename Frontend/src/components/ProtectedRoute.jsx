import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { obtenerSesion, esContrasenaTemporal } from '../services/session'

/**
 * Wraps protected routes and redirects to the login page if not logged in.
 * Also blocks non-admin users from accessing admin routes.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const { pathname } = useLocation()

  // Fetch session
  const sesion = obtenerSesion()

  // If no session, redirect to login
  if (!sesion) {
    return <Navigate to="/" replace />
  }

  // Force users with a temporary password to change it before doing anything else.
  if (esContrasenaTemporal() && pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />
  }

  // Check for allowed roles
  if (allowedRoles && !allowedRoles.includes(sesion?.rol)) {
    return <Navigate to="/home" replace />
  }

  // Everything is fine, render outlet
  return children ?? <Outlet />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.number),
}
