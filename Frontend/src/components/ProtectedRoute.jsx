import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { obtenerSesion, esContrasenaTemporal } from '../services/session'

/**
 * Envuelve las rutas protegidas y redirige a la página de inicio de sesión si no hay sesión.
 * También impide que los usuarios sin rol de administrador accedan a rutas de administración.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const { pathname } = useLocation()

  // Obtiene la sesión
  const sesion = obtenerSesion()

  // Si no hay sesión, redirige al inicio de sesión
  if (!sesion) {
    return <Navigate to="/" replace />
  }

  // Obliga a los usuarios con contraseña temporal a cambiarla antes de hacer cualquier otra cosa.
  if (esContrasenaTemporal() && pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />
  }

  // Verifica los roles permitidos
  if (allowedRoles && !allowedRoles.includes(sesion?.rol)) {
    return <Navigate to="/home" replace />
  }

  // Todo está correcto, renderiza el outlet
  return children ?? <Outlet />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.number),
}
