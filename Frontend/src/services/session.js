const SESSION_KEY = 'pingponeros_session'
const TEMP_PW_KEY = 'pingponeros_temp_password'

/**
 * Decode a JWT payload without verifying the signature
 * (signature verification is handled by the backend).
 * @param {string} token
 * @returns {object|null}
 */
function decodificarPayload(token) {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null
    const base64 = payloadB64.replaceAll('-', '+').replaceAll('_', '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.codePointAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Save the JWT token to SessionStorage.
 * The expiration is obtained from the `exp` claim of the token itself (seconds epoch).
 *
 * Whether the password is temporary lives outside the token (the backend keeps it
 * out of the claims), so we persist it here as a sidecar flag. This lets the
 * forced-change gate survive page refreshes / direct navigation.
 * @param {string} token JWT received from the backend
 * @param {boolean} [esTemporal] Whether the logged-in password is temporary.
 */
export function guardarSesion(token, esTemporal = false) {
  if (typeof token !== 'string' || !token) return
  sessionStorage.setItem(SESSION_KEY, token)
  if (esTemporal) {
    sessionStorage.setItem(TEMP_PW_KEY, '1')
  } else {
    sessionStorage.removeItem(TEMP_PW_KEY)
  }
}

/**
 * Returns the user's decoded payload if the token exists and has not expired.
 * or null if it has expired / does not exist / is invalid.
 * @returns {object|null}
 */
export function obtenerSesion() {
  const token = sessionStorage.getItem(SESSION_KEY)
  if (!token) return null

  const payload = decodificarPayload(token)
  if (!payload) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  // exp comes in seconds (epoch), Date.now() in milliseconds
  if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  return payload
}

/**
 * Returns the raw JWT token (to send in the Authorization header),
 * or null if it does not exist or has expired.
 * @returns {string|null}
 */
export function obtenerToken() {
  const token = sessionStorage.getItem(SESSION_KEY)
  if (!token) return null
  // reuses expiration validation
  if (!obtenerSesion()) return null
  return token
}

/**
 * Returns true when the active session was started with a temporary password
 * and must be changed before continuing. Guarded by a valid token so a stale
 * flag (no session / expired token) reads false.
 * @returns {boolean}
 */
export function esContrasenaTemporal() {
  if (!obtenerToken()) return false
  return sessionStorage.getItem(TEMP_PW_KEY) === '1'
}

/**
 * End the active session.
 */
export function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(TEMP_PW_KEY)
}
