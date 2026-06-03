import { describe, expect, it } from 'vitest'
import {
  clearAreaConflicts,
  isUnidadInArea,
  resolvePlazaFieldChange,
  resolveUnidadDependencyChange,
} from '../utils/organizationHierarchy'

describe('organizationHierarchy utilities', () => {
  it('rellena el área de una unidad al seleccionar un departamento', () => {
    const result = resolveUnidadDependencyChange({
      formData: { idArea: '', idDepartamento: '', idSeccion: '' },
      parentType: 'departamento',
      name: 'idDepartamento',
      value: '2',
      rawDepartamentos: [{ id: 2, idArea: 5, nombre: 'Compras' }],
    })

    expect(result).toEqual({
      idArea: '5',
      idDepartamento: '2',
      idSeccion: '',
    })
  })

  it('rellena área y dependencia al seleccionar una unidad con departamento', () => {
    const result = resolvePlazaFieldChange({
      formData: { idArea: '', idDepartamento: '', idSeccion: '', idUnidad: '' },
      name: 'idUnidad',
      value: '7',
      rawUnidades: [{ id: 7, idDepartamento: 3, nombre: 'Portal' }],
      rawDepartamentos: [{ id: 3, idArea: 9, nombre: 'TI' }],
    })

    expect(result.formData).toEqual({
      idArea: '9',
      idDepartamento: '3',
      idSeccion: '',
      idUnidad: '7',
    })
    expect(result.parentType).toBe('departamento')
    expect(result.conflict).toBe('')
  })

  it('rellena área y dependencia al seleccionar una unidad con sección', () => {
    const result = resolvePlazaFieldChange({
      formData: { idArea: '', idDepartamento: '4', idSeccion: '', idUnidad: '' },
      name: 'idUnidad',
      value: '8',
      rawUnidades: [{ id: 8, idArea: 2, idSeccion: 6, nombre: 'Soporte' }],
    })

    expect(result.formData).toEqual({
      idArea: '2',
      idDepartamento: '',
      idSeccion: '6',
      idUnidad: '8',
    })
    expect(result.parentType).toBe('seccion')
  })

  it('limpia dependencias incompatibles cuando cambia el área', () => {
    const result = clearAreaConflicts({
      formData: {
        idArea: '2',
        idDepartamento: '1',
        idSeccion: '',
        idUnidad: '4',
      },
      areaValue: '2',
      rawDepartamentos: [{ id: 1, idArea: 1, nombre: 'Compras' }],
      rawUnidades: [{ id: 4, idArea: 2, nombre: 'Portal' }],
      includeUnidad: true,
    })

    expect(result.formData).toMatchObject({
      idArea: '2',
      idDepartamento: '',
      idUnidad: '4',
    })
    expect(result.conflict).toMatch(/departamento seleccionado/)
  })

  it('detects a unit area through its department', () => {
    const unidad = { id: 5, idDepartamento: 2, nombre: 'Portal' }

    expect(
      isUnidadInArea(unidad, '8', {
        rawDepartamentos: [{ id: 2, idArea: 8, nombre: 'TI' }],
      }),
    ).toBe(true)
  })
})
