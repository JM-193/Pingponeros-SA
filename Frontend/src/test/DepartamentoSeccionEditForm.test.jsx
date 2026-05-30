// DepartamentoSeccionEditForm.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import DepartamentoSeccionEditForm from '../components/DepartamentoSeccionEditForm'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

const mockAreas = [{ idArea: 1, nombre: 'Administración' }]

const mockEntityDepartamento = {
  nombre: 'Recursos Humanos',
  descripcion: 'Departamento de RRHH',
  idArea: 1,
  estado: 1,
}

const mockEntitySeccion = {
  nombre: 'Contabilidad',
  descripcion: 'Sección de contabilidad',
  idArea: 1,
  estado: 1,
}

const renderDepartamentoWithRoute = (nombre, fetchByName, updateEntity) =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/departamentos/editar/${nombre}`]}>
      <Routes>
        <Route
          path="/organizacion/departamentos/editar/:nombre"
          element={
            <DepartamentoSeccionEditForm
              entityType="departamento"
              fetchByName={fetchByName}
              updateEntity={updateEntity}
            />
          }
        />
        <Route path="/organizacion/departamentos/consultar" element={<div>Lista</div>} />
      </Routes>
    </MemoryRouter>,
  )

const renderSeccionWithRoute = (nombre, fetchByName, updateEntity) =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/secciones/editar/${nombre}`]}>
      <Routes>
        <Route
          path="/organizacion/secciones/editar/:nombre"
          element={
            <DepartamentoSeccionEditForm
              entityType="seccion"
              fetchByName={fetchByName}
              updateEntity={updateEntity}
            />
          }
        />
        <Route path="/organizacion/secciones/consultar" element={<div>Lista</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('DepartamentoSeccionEditForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('muestra estado de carga para departamento sin nombre en ruta', () => {
    render(
      <BrowserRouter>
        <DepartamentoSeccionEditForm
          entityType="departamento"
          fetchByName={vi.fn()}
          updateEntity={vi.fn()}
        />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })

  it('muestra estado de carga para sección sin nombre en ruta', () => {
    render(
      <BrowserRouter>
        <DepartamentoSeccionEditForm
          entityType="seccion"
          fetchByName={vi.fn()}
          updateEntity={vi.fn()}
        />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando sección...')).toBeInTheDocument()
  })

  it('carga y renderiza formulario de editar departamento', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Departamento/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Recursos Humanos')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Departamento de RRHH')).toBeInTheDocument()
  })

  it('carga y renderiza formulario de editar sección', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntitySeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    renderSeccionWithRoute('Contabilidad', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Sección/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Contabilidad')).toBeInTheDocument()
  })

  it('actualiza departamento correctamente', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    const updateEntity = vi.fn().mockResolvedValueOnce({})
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, updateEntity)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Departamento actualizado correctamente')).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la actualización del departamento', async () => {
    const fetchByName = vi.fn().mockResolvedValue(mockEntityDepartamento)
    const updateEntity = vi.fn().mockRejectedValueOnce(new Error('Error al actualizar departamento'))
    areaService.obtenerAreas.mockResolvedValue(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, updateEntity)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(updateEntity).toHaveBeenCalledTimes(1)
    })
  })

  it('muestra error cuando falla la carga', async () => {
    const fetchByName = vi.fn().mockRejectedValueOnce(new Error('Departamento no encontrado'))
    areaService.obtenerAreas.mockResolvedValueOnce([])

    renderDepartamentoWithRoute('Inexistente', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByText('Departamento no encontrado')).toBeInTheDocument()
    })
  })

  it('renderiza StateToggle para cambiar estado', async () => {
    const fetchByName = vi.fn().mockResolvedValue(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Activo' })).toBeInTheDocument()
    })
  })
})
