import { apiFetch } from './apiClient'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Obtiene el resumen completo del panel administrativo: indicadores, distribuciones para los
 * gráficos, tablas de actividad reciente y conteos de alertas. Se entrega en una sola respuesta.
 * @returns {Promise<object>} El objeto de resumen del dashboard.
 */
export async function obtenerResumenDashboard() {
  return apiFetch('/dashboard', { method: 'GET', headers: JSON_HEADERS })
}
