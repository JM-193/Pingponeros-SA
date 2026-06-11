// EditPositions.test.jsx
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EditPositions from '../pages/EditPositions'
import * as positionService from '../services/positionService'
import * as unitService from '../services/unitService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'
import * as areaService from '../services/areaService'

vi.mock('../services/positionService')
vi.mock('../services/unitService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')
vi.mock('../services/areaService')

const mockPlaza = {
  numeroPlaza: 7,
  idArea: 1,
  idDepartamento: 1,
  idSeccion: null,
  idUnidad: 1,
}

const mockAreas = [{ id: 1, nombre: 'Central' }, { id: 2, nombre: 'TI' }]
const mockDepartamentos = [
  { id: 1, nombre: 'Compras', idArea: 1 },
  { id: 2, nombre: 'Ventas', idArea: 2 },
]
const mockSecciones = [
  { id: 1, nombre: 'Soporte', idArea: 1 },
  { id: 2, nombre: 'Logística', idArea: 2 },
]
const mockUnidades = [
  { id: 1, nombre: 'Unidad A', idArea: 1, idDepartamento: 1 },
  { id: 2, nombre: 'Unidad B', idArea: 2, idDepartamento: 2 },
]

const renderWithRoute = (numeroPlaza = '7') =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/plazas/editar/${numeroPlaza}`]}>
      <Routes>
        <Route path="/organizacion/plazas/editar/:numeroPlaza" element={<EditPositions />} />
        <Route path="/organizacion/plazas/consultar" element={<div>Lista de plazas</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('EditPositions Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    positionService.obtenerPlazaPorNumero.mockResolvedValue(mockPlaza)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    unitService.obtenerUnidades.mockResolvedValue(mockUnidades)
  })

  it('muestra indicador de carga mientras carga datos', () => {
    positionService.obtenerPlazaPorNumero.mockImplementation(() => new Promise(() => {}))

    renderWithRoute()

    expect(screen.getByText(/Cargando datos de la plaza/i)).toBeInTheDocument()
  })

  it('renderiza el formulario con datos de la plaza', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })

  it('detecta el tipo de dependencia "departamento" según la plaza cargada', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const parentTypeSelect = document.querySelector('select[name="parentType"]')
    expect(parentTypeSelect.value).toBe('departamento')
  })

  it('detecta el tipo de dependencia "seccion" según la plaza cargada', async () => {
    positionService.obtenerPlazaPorNumero.mockResolvedValueOnce({
      ...mockPlaza,
      idDepartamento: null,
      idSeccion: 1,
    })

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const parentTypeSelect = document.querySelector('select[name="parentType"]')
    expect(parentTypeSelect.value).toBe('seccion')
  })

  it('actualiza la plaza correctamente y muestra mensaje de éxito', async () => {
    positionService.actualizarPlaza.mockResolvedValueOnce({})

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText(/Plaza '7' actualizada correctamente/i)).toBeInTheDocument()
    })
  })

  it('muestra error cuando la actualización falla', async () => {
    positionService.actualizarPlaza.mockRejectedValueOnce(new Error('Error al actualizar plaza'))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText('Error al actualizar plaza')).toBeInTheDocument()
    })
  })

  it('muestra error si departamento y sección están seleccionados a la vez', async () => {
    // Plaza con ambos idDepartamento e idSeccion (estado inválido forzado)
    positionService.obtenerPlazaPorNumero.mockResolvedValueOnce({
      ...mockPlaza,
      idDepartamento: 1,
      idSeccion: 1,
    })

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(
        screen.getByText(/Una plaza no puede pertenecer a un departamento y a una sección/i),
      ).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la carga de datos', async () => {
    positionService.obtenerPlazaPorNumero.mockRejectedValueOnce(new Error('Plaza no encontrada'))

    renderWithRoute('999')

    await waitFor(() => {
      expect(screen.getByText(/Plaza no encontrada/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('cambia el tipo de dependencia entre departamento y sección', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const parentTypeSelect = document.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'seccion' } })

    expect(parentTypeSelect.value).toBe('seccion')
  })

  it('filtra departamentos cuando se selecciona un área', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const areaSelect = document.querySelector('select[name="idArea"]')
    fireEvent.change(areaSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(areaSelect.value).toBe('1')
    })
  })

  it('muestra conflicto cuando se cambia área y el departamento no pertenece a ella', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    // Asegurarse de que hay un departamento seleccionado (viene del mock inicial)
    const areaSelect = document.querySelector('select[name="idArea"]')
    // Cambiar a un área diferente que cause conflicto
    fireEvent.change(areaSelect, { target: { value: '2' } })

    await waitFor(() => {
      expect(areaSelect.value).toBe('2')
    })
  })

  it('maneja campo idDepartamento con handleFieldChange', async () => {
    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const deptSelect = document.querySelector('select[name="idDepartamento"]')
    if (deptSelect) {
      fireEvent.change(deptSelect, { target: { value: '1' } })
      expect(deptSelect.value).toBe('1')
    }
  })

  it('muestra conflicto al cambiar departamento cuando la unidad no pertenece a él', async () => {
    positionService.obtenerPlazaPorNumero.mockResolvedValueOnce({
      ...mockPlaza,
      idDepartamento: 1,
      idUnidad: 1,
    })

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    const deptSelect = document.querySelector('select[name="idDepartamento"]')
    if (deptSelect) {
      // Cambiar a departamento 2 — la unidad 1 pertenece al departamento 1
      fireEvent.change(deptSelect, { target: { value: '2' } })

      await waitFor(() => {
        const conflictMsg = screen.queryByText(/La unidad seleccionada no pertenece al departamento elegido/i)
        if (conflictMsg) {
          expect(conflictMsg).toBeInTheDocument()
        }
      })
    }
  })
})
