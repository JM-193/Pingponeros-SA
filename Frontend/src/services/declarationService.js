import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Datos preexistentes (plazas activas con cargo, clase ocupacional, lugar y titular) para autocompletar.
export async function obtenerAutocompletado(correo) {
  return apiFetch(
    `/declaraciones/usuario/${encodeURIComponent(correo)}/autocompletado`,
    { method: 'GET', headers: JSON_HEADERS },
    { emptyArrayOn404: true },
  )
}

// Borrador activo del usuario (con detalle) o null si no tiene.
export async function obtenerDeclaracionActiva(correo) {
  return apiFetch(`/declaraciones/usuario/${encodeURIComponent(correo)}/activa`, {
    method: 'GET',
    headers: JSON_HEADERS,
  })
}

// Historial de declaraciones completas del usuario.
export async function obtenerHistorialDeclaraciones(correo) {
  return apiFetch(
    `/declaraciones/usuario/${encodeURIComponent(correo)}`,
    { method: 'GET', headers: JSON_HEADERS },
    { emptyArrayOn404: true },
  )
}

// Detalle completo de una declaración (vista de solo lectura).
export async function obtenerDeclaracion(id) {
  return apiFetch(`/declaraciones/${id}`, { method: 'GET', headers: JSON_HEADERS })
}

export async function crearDeclaracion(correo, numeroPlaza) {
  return apiFetch(`/declaraciones/usuario/${encodeURIComponent(correo)}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ numeroPlaza }),
  })
}

export async function guardarDeclaracion(id, payload) {
  return apiFetch(`/declaraciones/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  })
}

export async function completarDeclaracion(id) {
  return apiFetch(`/declaraciones/${id}/completar`, { method: 'PUT', headers: JSON_HEADERS })
}

export async function cancelarDeclaracion(id) {
  return apiFetch(`/declaraciones/${id}`, { method: 'DELETE', headers: JSON_HEADERS })
}
