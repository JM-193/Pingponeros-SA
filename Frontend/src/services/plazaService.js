// plazaService.js
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Obtiene todas las plazas.
 * @returns {Promise<Array>} Lista de plazas.
 */
export async function obtenerPlazas() {
  const response = await fetch(`${API_URL}/plazas`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return await response.json()
}

/**
 * Crea una nueva plaza.
 * @param {{ numeroPlaza: number, idUnidad?: number, idDepartamento?: number, idSeccion?: number, idArea?: number }} datos
 * @returns {Promise<object>} Respuesta del servidor.
 */
export async function crearPlaza(datos) {
  const response = await fetch(`${API_URL}/plazas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.mensaje ?? err.detail ?? err.title ?? `Error inesperado (${response.status})`)
  }

  return await response.json()
}
