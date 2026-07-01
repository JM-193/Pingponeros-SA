import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function obtenerPuestos() {
  return apiFetch('/puestos-trabajo', { method: 'GET', headers: JSON_HEADERS })
}

export async function obtenerPuestoPorNombre(nombre) {
  return apiFetch(`/puestos-trabajo/${encodeURIComponent(nombre)}`, { method: 'GET', headers: JSON_HEADERS })
}

export async function crearPuesto(datos) {
  return apiFetch('/puestos-trabajo', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(datos),
  })
}

export async function eliminarPuesto(nombre) {
  return apiFetch(`/puestos-trabajo/${encodeURIComponent(nombre)}`, { method: 'DELETE', headers: JSON_HEADERS })
}

export async function obtenerFuncionesDePuesto(idPuesto) {
  return apiFetch(`/puestos-trabajo/${idPuesto}/funciones`, { method: 'GET', headers: JSON_HEADERS })
}

export async function agregarFuncionAPuesto(idPuesto, idFuncion) {
  return apiFetch(`/puestos-trabajo/${idPuesto}/funciones`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ idFuncion }),
  })
}

export async function quitarFuncionDePuesto(idPuesto, idFuncion) {
  return apiFetch(`/puestos-trabajo/${idPuesto}/funciones/${idFuncion}`, { method: 'DELETE', headers: JSON_HEADERS })
}
