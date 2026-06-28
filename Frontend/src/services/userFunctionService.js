import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function obtenerTodasFuncionesUsuario() {
  return apiFetch('/funciones-usuarios', { method: 'GET', headers: JSON_HEADERS })
}

export async function obtenerFuncionesUsuarioPorCorreo(correo) {
  return apiFetch(`/funciones-usuarios/${encodeURIComponent(correo)}`, { method: 'GET', headers: JSON_HEADERS })
}

export async function crearFuncionUsuario(datos) {
  return apiFetch('/funciones-usuarios', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

export async function eliminarFuncionUsuario(id) {
  return apiFetch(`/funciones-usuarios/${id}`, { method: 'DELETE', headers: JSON_HEADERS })
}
