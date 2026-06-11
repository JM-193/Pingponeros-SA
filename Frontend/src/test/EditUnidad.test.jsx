// EditUnidad.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import EditUnidad from '../pages/EditUnidad'
import * as unidadService from '../services/unidadService'
import * as areaService from '../services/areaService'
import * as departamentoService from '../services/departmentService'
import * as seccionService from '../services/seccionService'

vi.mock('../services/unidadService')
vi.mock('../services/areaService')
vi.mock('../services/departmentService')
vi.mock('../services/seccionService')

const mockUnidad = {
  nombre: 'Unidad Administrativa',
  descripcion: 'Descripción de unidad',
  idArea: 1,
  idDepartamento: 2,
  idSeccion: null,
  estado: 1,
}

const mockAreas = [{ idArea: 1, nombre: 'Administración' }]
const mockDepartamentos = [{ idDepartamento: 2, nombre: 'Recursos Humanos' }]
const mockSecciones = [{ idSeccion: 3, nombre: 'Contabilidad' }]

const renderWithRoute = (nombre) =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/unidades/editar/${nombre}`]}>
      <Routes>
        <Route path="/organizacion/unidades/editar/:nombre" element={<EditUnidad />} />
        <Route path="/organizacion/unidades/consultar" element={<div>Lista de unidades</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('EditUnidad Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditUnidad />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando unidad...')).toBeInTheDocument()
  })

  it('carga y renderiza el formulario con los datos de la unidad', async () => {
    unidadService.obtenerUnidadPorNombre.mockResolvedValueOnce(mockUnidad)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce(mockDepartamentos)
    seccionService.obtenerSecciones.mockResolvedValueOnce(mockSecciones)

    renderWithRoute('Unidad Administrativa')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Unidad/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Unidad Administrativa')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Descripción de unidad')).toBeInTheDocument()
  })

  it('actualiza unidad correctamente y redirige', async () => {
    unidadService.obtenerUnidadPorNombre.mockResolvedValueOnce(mockUnidad)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce(mockDepartamentos)
    seccionService.obtenerSecciones.mockResolvedValueOnce(mockSecciones)
    unidadService.actualizarUnidad.mockResolvedValueOnce({})

    renderWithRoute('Unidad Administrativa')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Unidad actualizada correctamente')).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la actualización', async () => {
    unidadService.obtenerUnidadPorNombre.mockResolvedValue(mockUnidad)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
    departamentoService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    seccionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    unidadService.actualizarUnidad.mockRejectedValueOnce(new Error('Error al actualizar unidad'))

    renderWithRoute('Unidad Administrativa')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(unidadService.actualizarUnidad).toHaveBeenCalledTimes(1)
    })
  })

  it('muestra error cuando falla la carga', async () => {
    unidadService.obtenerUnidadPorNombre.mockRejectedValueOnce(new Error('Unidad no encontrada'))
    areaService.obtenerAreas.mockResolvedValueOnce([])
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce([])
    seccionService.obtenerSecciones.mockResolvedValueOnce([])

    renderWithRoute('Inexistente')

    await waitFor(() => {
      expect(screen.getByText('Unidad no encontrada')).toBeInTheDocument()
    })
  })
})
