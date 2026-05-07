// organizationUnitForm.test.js
import { describe, it, expect } from 'vitest'
import {
  createOrganizationUnitInputChangeHandler,
  getOrganizationUnitFormError,
  getOrganizationUnitPayload,
} from '../utils/organizationUnitForm'

describe('organizationUnitForm utilities', () => {
  describe('createOrganizationUnitInputChangeHandler', () => {
    it('actualiza formData correctamente', () => {
      const formData = { nombre: '', descripcion: '' }
      const setFormData = vi.fn((fn) => {
        return fn(formData)
      })
      const clearFeedback = vi.fn()

      const handler = createOrganizationUnitInputChangeHandler(
        setFormData,
        clearFeedback,
      )

      const event = {
        target: { name: 'nombre', value: 'Administración' },
      }

      handler(event)

      expect(setFormData).toHaveBeenCalled()
      expect(clearFeedback).toHaveBeenCalled()
    })

    it('limpia feedback cuando hay cambio', () => {
      const clearFeedback = vi.fn()
      const setFormData = vi.fn()

      const handler = createOrganizationUnitInputChangeHandler(
        setFormData,
        clearFeedback,
      )

      handler({ target: { name: 'nombre', value: 'Test' } })

      expect(clearFeedback).toHaveBeenCalled()
    })

    it('actualiza el campo nombre', () => {
      const updates = []
      const setFormData = vi.fn((fn) => {
        const result = fn({ nombre: '', descripcion: '' })
        updates.push(result)
      })

      const handler = createOrganizationUnitInputChangeHandler(
        setFormData,
        () => {},
      )

      handler({ target: { name: 'nombre', value: 'NewName' } })

      expect(updates[0].nombre).toBe('NewName')
    })

    it('actualiza el campo descripcion', () => {
      const updates = []
      const setFormData = vi.fn((fn) => {
        const result = fn({ nombre: 'Test', descripcion: '' })
        updates.push(result)
      })

      const handler = createOrganizationUnitInputChangeHandler(
        setFormData,
        () => {},
      )

      handler({ target: { name: 'descripcion', value: 'New desc' } })

      expect(updates[0].descripcion).toBe('New desc')
    })

    it('preserva otros campos al actualizar uno', () => {
      const initialData = { nombre: 'Original', descripcion: 'Original desc' }
      const setFormData = vi.fn((fn) => {
        return fn(initialData)
      })

      const handler = createOrganizationUnitInputChangeHandler(
        setFormData,
        () => {},
      )

      handler({ target: { name: 'nombre', value: 'Updated' } })

      const callback = setFormData.mock.calls[0][0]
      const result = callback(initialData)

      expect(result.descripcion).toBe('Original desc')
    })
  })

  describe('getOrganizationUnitFormError', () => {
    it('retorna error cuando nombre está vacÃ­o', () => {
      const formData = { nombre: '', descripcion: 'Descripción' }

      const error = getOrganizationUnitFormError(formData)

      expect(error).toBe('El nombre del área es requerido')
    })

    it('retorna error cuando nombre solo tiene espacios', () => {
      const formData = { nombre: '   ', descripcion: 'Descripción' }

      const error = getOrganizationUnitFormError(formData)

      expect(error).toBe('El nombre del área es requerido')
    })

    it('retorna error cuando descripción está vacÃ­a', () => {
      const formData = { nombre: 'Administración', descripcion: '' }

      const error = getOrganizationUnitFormError(formData)

      expect(error).toBe('La descripción es requerida')
    })

    it('retorna error cuando descripción solo tiene espacios', () => {
      const formData = { nombre: 'Administración', descripcion: '   ' }

      const error = getOrganizationUnitFormError(formData)

      expect(error).toBe('La descripción es requerida')
    })

    it('retorna string vacÃ­o cuando ambos campos son válidos', () => {
      const formData = {
        nombre: 'Administración',
        descripcion: 'Ãrea de administración',
      }

      const error = getOrganizationUnitFormError(formData)

      expect(error).toBe('')
    })

    it('valida correctamente con nombre y descripción con espacios', () => {
      const formData = {
        nombre: 'Ãrea de Contabilidad',
        descripcion: 'Encargada de procesos contables',
      }

      const error = getOrganizationUnitFormError(formData)

      expect(error).toBe('')
    })
  })

  describe('getOrganizationUnitPayload', () => {
    it('retorna nombre y descripción trimmed', () => {
      const formData = {
        nombre: '  Administración  ',
        descripcion: '  Descripción  ',
      }

      const payload = getOrganizationUnitPayload(formData)

      expect(payload.nombre).toBe('Administración')
      expect(payload.descripcion).toBe('Descripción')
    })

    it('retorna estructura correcta', () => {
      const formData = {
        nombre: 'Test Area',
        descripcion: 'Test Description',
      }

      const payload = getOrganizationUnitPayload(formData)

      expect(payload).toHaveProperty('nombre')
      expect(payload).toHaveProperty('descripcion')
      expect(Object.keys(payload)).toHaveLength(2)
    })

    it('no incluye espacios en blanco', () => {
      const formData = {
        nombre: '  Test  ',
        descripcion: '  Desc  ',
      }

      const payload = getOrganizationUnitPayload(formData)

      expect(payload.nombre).not.toContain('  ')
      expect(payload.descripcion).not.toContain('  ')
    })

    it('preserva contenido interno con espacios', () => {
      const formData = {
        nombre: 'Ãrea de Operaciones',
        descripcion: 'Encargada de todas las operaciones',
      }

      const payload = getOrganizationUnitPayload(formData)

      expect(payload.nombre).toBe('Ãrea de Operaciones')
      expect(payload.descripcion).toBe('Encargada de todas las operaciones')
    })
  })
})

