const SESSION_KEY = 'pingponeros_session'
const SESSION_TTL_MS = 60 * 60 * 1000 // 1 hora

/**
 * Guarda los datos del usuario en SessionStorage con timestamp de expiración.
 * @param {object} usuario
 */
export function guardarSesion(usuario) {
  const payload = {
    usuario,
    expira: Date.now() + SESSION_TTL_MS,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
}

/**
 * Devuelve los datos del usuario si la sesión es válida, o null si expiró / no existe.
 * @returns {object|null}
 */
export function obtenerSesion() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const { usuario, expira } = JSON.parse(raw)
    if (Date.now() > expira) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return usuario
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

/**
 * Elimina la sesión activa.
 */
export function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY)
}
