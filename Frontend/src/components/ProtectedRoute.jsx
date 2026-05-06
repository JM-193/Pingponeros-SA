import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { obtenerSesion } from '../services/session'

/**
 * Envuelve rutas protegidas. Si no hay sesión válida redirige al login.
 */
export default function ProtectedRoute({ children }) {
  const sesion = obtenerSesion()
  return sesion ? children : <Navigate to="/" replace />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}
