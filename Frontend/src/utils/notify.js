import { toast } from 'react-toastify'
import { COLORS } from '../constants/colors'
import { criticalError } from './alerts'

// Notificaciones transitorias (toasts). Política de uso:
//  - notifySuccess: confirmaciones de operaciones (crear/actualizar correctos).
//  - notifyError:   errores recuperables y no bloqueantes (validaciones 4xx).
//  - notifyInfo:    avisos informativos.
// Para errores críticos/bloqueantes (5xx o backend caído) usar criticalError de ./alerts.

const BASE_OPTIONS = {
  position: 'top-right',
  autoClose: 4000,
  closeOnClick: true,
  pauseOnHover: true,
}

/**
 * Muestra un toast de éxito.
 * @param {string} mensaje
 * @param {object} [options] Opciones adicionales de react-toastify.
 */
export function notifySuccess(mensaje, options = {}) {
  return toast.success(mensaje, {
    ...BASE_OPTIONS,
    style: { background: COLORS.successSoftBg, color: COLORS.successStrong },
    progressStyle: { background: COLORS.successStrong },
    ...options,
  })
}

/**
 * Muestra un toast de error (no bloqueante).
 * @param {string} mensaje
 * @param {object} [options] Opciones adicionales de react-toastify.
 */
export function notifyError(mensaje, options = {}) {
  return toast.error(mensaje, {
    ...BASE_OPTIONS,
    style: { background: COLORS.errorSoftBg, color: COLORS.errorStrong },
    progressStyle: { background: COLORS.danger },
    ...options,
  })
}

/**
 * Muestra un toast informativo.
 * @param {string} mensaje
 * @param {object} [options] Opciones adicionales de react-toastify.
 */
export function notifyInfo(mensaje, options = {}) {
  return toast.info(mensaje, {
    ...BASE_OPTIONS,
    style: { background: COLORS.white, color: COLORS.primaryBtn },
    progressStyle: { background: COLORS.primaryBtn },
    ...options,
  })
}

/**
 * Reporta un error proveniente de la API según su gravedad:
 *  - status 0 (red caída) o >= 500: diálogo bloqueante (criticalError).
 *  - resto (4xx, errores de negocio): se delega al llamador para que lo
 *    muestre en línea (inline). Devuelve true si ya se manejó como crítico.
 * @param {Error & { status?: number }} err
 * @returns {boolean} true si el error se mostró como crítico (bloqueante).
 */
export function reportApiError(err) {
  const status = err?.status
  if (status === 0 || status >= 500) {
    criticalError(err?.message ?? 'No se pudo completar la operación. Intente nuevamente.')
    return true
  }
  return false
}
