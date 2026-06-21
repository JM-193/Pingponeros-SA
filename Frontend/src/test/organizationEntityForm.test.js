// OrganizationEntityForm.test.js
import { describe, it, expect } from 'vitest'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormErrors,
  getOrganizationEntityPayload,
} from '../utils/organizationEntityForm'

describe('OrganizationEntityForm utilities', () => {
  describe('createOrganizationEntityInputChangeHandler', () => {
    it('actualiza formData correctamente', () => {
      const formData = { nombre: '', descripcion: '' }
      const setFormData = vi.fn((fn) => {
        return fn(formData)
      })
      const clearFeedback = vi.fn()

      const handler = createOrganizationEntityInputChangeHandler(
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

      const handler = createOrganizationEntityInputChangeHandler(
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

      const handler = createOrganizationEntityInputChangeHandler(
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

      const handler = createOrganizationEntityInputChangeHandler(
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

      const handler = createOrganizationEntityInputChangeHandler(
        setFormData,
        () => {},
      )

      handler({ target: { name: 'nombre', value: 'Updated' } })

      const callback = setFormData.mock.calls[0][0]
      const result = callback(initialData)

      expect(result.descripcion).toBe('Original desc')
    })
  })

  describe('getOrganizationEntityFormErrors', () => {
    it('retorna error de nombre cuando está vacío', () => {
      const errors = getOrganizationEntityFormErrors({ nombre: '', descripcion: 'Descripción' })
      expect(errors.nombre).toBe('El nombre del área es requerido')
    })

    it('retorna error de nombre cuando solo tiene espacios', () => {
      const errors = getOrganizationEntityFormErrors({ nombre: '   ', descripcion: 'Descripción' })
      expect(errors.nombre).toBe('El nombre del área es requerido')
    })

    it('retorna error de descripción cuando está vacía', () => {
      const errors = getOrganizationEntityFormErrors({ nombre: 'Administración', descripcion: '' })
      expect(errors.descripcion).toBe('La descripción es requerida')
    })

    it('retorna error de descripción cuando solo tiene espacios', () => {
      const errors = getOrganizationEntityFormErrors({ nombre: 'Administración', descripcion: '   ' })
      expect(errors.descripcion).toBe('La descripción es requerida')
    })

    it('retorna objeto vacío cuando ambos campos son válidos', () => {
      const errors = getOrganizationEntityFormErrors({
        nombre: 'Administración',
        descripcion: 'Área de administración',
      })
      expect(errors).toEqual({})
    })

    it('reporta nombre y descripción a la vez cuando ambos faltan', () => {
      const errors = getOrganizationEntityFormErrors({ nombre: '', descripcion: '' })
      expect(errors.nombre).toBe('El nombre del área es requerido')
      expect(errors.descripcion).toBe('La descripción es requerida')
    })

    it('retorna error de área cuando requireArea y no hay idArea', () => {
      const errors = getOrganizationEntityFormErrors(
        { nombre: 'X', descripcion: 'Y', idArea: '' },
        { requireArea: true },
      )
      expect(errors.idArea).toBe('El área es requerida')
    })
  })

  describe('getOrganizationEntityPayload', () => {
    it('retorna nombre y descripción trimmed', () => {
      const formData = {
        nombre: '  Administración  ',
        descripcion: '  Descripción  ',
      }

      const payload = getOrganizationEntityPayload(formData)

      expect(payload.nombre).toBe('Administración')
      expect(payload.descripcion).toBe('Descripción')
      expect(payload.estado).toBe(1)
    })

    it('retorna estructura correcta', () => {
      const formData = {
        nombre: 'Test Area',
        descripcion: 'Test Description',
      }

      const payload = getOrganizationEntityPayload(formData)

      expect(payload).toHaveProperty('nombre')
      expect(payload).toHaveProperty('descripcion')
      expect(payload).toHaveProperty('estado')
      expect(Object.keys(payload)).toHaveLength(3)
    })

    it('no incluye espacios en blanco', () => {
      const formData = {
        nombre: '  Test  ',
        descripcion: '  Desc  ',
      }

      const payload = getOrganizationEntityPayload(formData)

      expect(payload.nombre).not.toContain('  ')
      expect(payload.descripcion).not.toContain('  ')
    })

    it('preserva contenido interno con espacios', () => {
      const formData = {
        nombre: 'Área de Operaciones',
        descripcion: 'Encargada de todas las operaciones',
      }

      const payload = getOrganizationEntityPayload(formData)

      expect(payload.nombre).toBe('Área de Operaciones')
      expect(payload.descripcion).toBe('Encargada de todas las operaciones')
    })

    it('incluye idArea cuando se solicita', () => {
      const formData = {
        nombre: 'Unidad A',
        descripcion: 'Desc',
        idArea: '5',
      }

      const payload = getOrganizationEntityPayload(formData, { includeArea: true })

      expect(payload.idArea).toBe(5)
    })

    it('incluye idDepartamento cuando parentType es departamento', () => {
      const formData = {
        nombre: 'Unidad A',
        descripcion: 'Desc',
        idDepartamento: '7',
      }

      const payload = getOrganizationEntityPayload(formData, { parentType: 'departamento' })

      expect(payload.idDepartamento).toBe(7)
      expect(payload.idSeccion).toBeUndefined()
    })

    it('incluye idSeccion cuando parentType es seccion', () => {
      const formData = {
        nombre: 'Unidad B',
        descripcion: 'Desc',
        idSeccion: '9',
      }

      const payload = getOrganizationEntityPayload(formData, { parentType: 'seccion' })

      expect(payload.idSeccion).toBe(9)
      expect(payload.idDepartamento).toBeUndefined()
    })
  })
})
