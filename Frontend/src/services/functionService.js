import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function obtenerFunciones() {
  return apiFetch('/funciones', { method: 'GET', headers: JSON_HEADERS })
}

export async function crearFuncion(datos) {
  return apiFetch('/funciones', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

export async function eliminarFuncion(nombre) {
  return apiFetch(`/funciones/${encodeURIComponent(nombre)}`, { method: 'DELETE', headers: JSON_HEADERS })
}
