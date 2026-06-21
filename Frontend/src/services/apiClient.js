const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5119'

/**
 * Error normalizado de la capa de API. Conserva el código de estado HTTP
 * (`status`) y el código de negocio opcional (`codigo`) que devuelve el backend,
 * para que las páginas puedan decidir cómo mostrarlo (toast vs. alerta crítica).
 * Un `status` de 0 indica un fallo de red (el backend no respondió).
 */
export class ApiError extends Error {
  constructor(message, status, codigo) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
  }
}

/** Lee el cuerpo JSON de forma tolerante: nunca lanza, devuelve {} si falla o no hay cuerpo. */
async function leerCuerpo(response) {
  if (typeof response.json !== 'function') return {}
  return response.json().catch(() => ({}))
}

/**
 * Envoltura única sobre `fetch` que centraliza:
 *  - el manejo de fallos de red (el backend caído) -> ApiError con status 0,
 *  - la comprobación de `response.ok` y el parseo del mensaje de error del backend
 *    (`mensaje` -> `detail` -> `title` -> mensaje genérico),
 *  - las respuestas sin cuerpo (204 No Content).
 *
 * @param {string} path Ruta relativa al API (p. ej. '/usuarios').
 * @param {RequestInit} [options] Opciones de fetch. Si se omite, se llama a fetch con un solo argumento.
 * @param {{ emptyArrayOn404?: boolean }} [config] `emptyArrayOn404` devuelve [] en vez de lanzar cuando el backend responde 404 (listados vacíos).
 * @returns {Promise<any>} El cuerpo JSON parseado, [] (404 configurado) o null (204).
 */
export async function apiFetch(path, options, { emptyArrayOn404 = false } = {}) {
  let response
  try {
    response = options === undefined
      ? await fetch(`${API_URL}${path}`)
      : await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifique su conexión.', 0)
  }

  if (emptyArrayOn404 && response.status === 404) {
    return []
  }

  if (!response.ok) {
    const data = await leerCuerpo(response)
    throw new ApiError(
      data.mensaje ?? data.detail ?? data.title ?? `Error inesperado (${response.status})`,
      response.status,
      data.codigo,
    )
  }

  if (response.status === 204) return null
  return leerCuerpo(response)
}
