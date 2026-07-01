import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function obtenerClasesOcupacionales() {
  return apiFetch('/clases-ocupacionales', { method: 'GET', headers: JSON_HEADERS })
}

export async function crearClaseOcupacional(datos) {
  return apiFetch('/clases-ocupacionales', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

export async function eliminarClaseOcupacional(id) {
  return apiFetch(`/clases-ocupacionales/${id}`, { method: 'DELETE', headers: JSON_HEADERS })
}
