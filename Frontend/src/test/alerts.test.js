// alerts.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as AlertsUtil from '../utils/alerts'

// alerts.js calls Swal.mixin(...) at module load and uses the returned
// instance's .fire() in every function. Hoisted so vi.mock can reference it.
const { mockFire } = vi.hoisted(() => ({ mockFire: vi.fn() }))

vi.mock('sweetalert2', () => ({
  default: {
    mixin: () => ({ fire: mockFire }),
  },
}))

describe('alert service', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockFire.mockClear()
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  describe('confirmAction', () => {
    it('retorna true si el usuario confirma la acción', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      const result = await AlertsUtil.confirmAction({ title: 'Eliminar' })

      expect(result).toBe(true)
    })

    it('retorna false si el usuario cancela la acción', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: false })

      const result = await AlertsUtil.confirmAction({ title: 'Eliminar' })

      expect(result).toBe(false)
    })

    it('configura el diálogo con icono warning y botón de cancelar', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      await AlertsUtil.confirmAction({ title: 'Eliminar', text: '¿Seguro?' })

      expect(mockFire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Eliminar',
          text: '¿Seguro?',
          icon: 'warning',
          showCancelButton: true,
        }),
      )
    })

    it('usa las etiquetas por defecto de los botones', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      await AlertsUtil.confirmAction({ title: 'Eliminar' })

      expect(mockFire).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
        }),
      )
    })

    it('usa las etiquetas personalizadas de los botones', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      await AlertsUtil.confirmAction({
        title: 'Eliminar',
        confirmLabel: 'Sí, eliminar',
        cancelLabel: 'No',
      })

      expect(mockFire).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'No',
        }),
      )
    })
  })

  describe('blockingInfo', () => {
    it('muestra un diálogo informativo con un solo botón "Entendido"', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      await AlertsUtil.blockingInfo('Aviso', 'Contraseña temporal')

      expect(mockFire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aviso',
          text: 'Contraseña temporal',
          icon: 'warning',
          confirmButtonText: 'Entendido',
        }),
      )
    })

    it('usa texto vacío por defecto', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      await AlertsUtil.blockingInfo('Aviso')

      expect(mockFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Aviso', text: '' }),
      )
    })

    it('retorna la promesa de Swal.fire', async () => {
      const fireResult = { isConfirmed: true }
      mockFire.mockResolvedValueOnce(fireResult)

      await expect(AlertsUtil.blockingInfo('Aviso')).resolves.toBe(fireResult)
    })
  })

  describe('criticalError', () => {
    it('muestra un diálogo de error con título "Error"', async () => {
      mockFire.mockResolvedValueOnce({ isConfirmed: true })

      await AlertsUtil.criticalError('El servidor no responde')

      expect(mockFire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          text: 'El servidor no responde',
          icon: 'error',
          confirmButtonText: 'Entendido',
        }),
      )
    })

    it('retorna la promesa de Swal.fire', async () => {
      const fireResult = { isConfirmed: true }
      mockFire.mockResolvedValueOnce(fireResult)

      await expect(AlertsUtil.criticalError('boom')).resolves.toBe(fireResult)
    })
  })
})
