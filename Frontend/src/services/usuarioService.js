const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Crea un nuevo usuario en el backend.
 * @param {{ correoInstitucional: string, primerNombre: string, segundoNombre?: string,
 *           primerApellido: string, segundoApellido?: string, rol: number }} datos
 * @returns {Promise<object>} El usuario creado devuelto por el servidor.
 */
export async function crearUsuario(datos) {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    // El backend devuelve { mensaje } en errores controlados, o { detail } en ProblemDetails
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  const data = await response.json()
  // Devuelve el objeto completo (incluye mensaje y contrasenaTemporal en creación)
  return data
}
