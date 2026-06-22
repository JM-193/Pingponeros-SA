import Swal from 'sweetalert2'
import { COLORS } from '../constants/colors'

// Diálogos modales bloqueantes (SweetAlert2). Política de uso:
//  - confirmAction: confirmaciones destructivas (eliminar/desactivar).
//  - criticalError: errores críticos o bloqueantes (5xx o backend caído),
//    típicamente cuando el ApiError trae status 0 o >= 500.
// Para feedback transitorio usar los toasts de ./notify.

const baseSwal = Swal.mixin({
  confirmButtonColor: COLORS.primaryBtn,
  cancelButtonColor: COLORS.secondaryBtn,
  buttonsStyling: true,
  reverseButtons: true,
})

/**
 * Muestra un diálogo de confirmación y resuelve a true si el usuario confirma.
 * @param {{ title: string, text?: string, confirmLabel?: string, cancelLabel?: string }} opciones
 * @returns {Promise<boolean>}
 */
export async function confirmAction({
  title,
  text = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}) {
  const result = await baseSwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmLabel,
    cancelButtonText: cancelLabel,
  })
  return result.isConfirmed
}

/**
 * Muestra un diálogo informativo bloqueante de un solo botón que el usuario
 * debe descartar. Útil para avisos obligatorios (p. ej. contraseña temporal).
 * @param {string} title
 * @param {string} [text]
 * @returns {Promise<unknown>}
 */
export function blockingInfo(title, text = '') {
  return baseSwal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'Entendido',
  })
}

/**
 * Muestra un diálogo de error bloqueante para fallos críticos.
 * @param {string} mensaje
 * @returns {Promise<unknown>}
 */
export function criticalError(mensaje) {
  return baseSwal.fire({
    title: 'Error',
    text: mensaje,
    icon: 'error',
    confirmButtonText: 'Entendido',
  })
}
