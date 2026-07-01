// EditUnits.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditUnits from '../pages/EditUnits'
import * as unitService from '../services/unitService'
import * as areaService from '../services/areaService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'

vi.mock('../services/unitService')
vi.mock('../services/areaService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')

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

describe('EditUnits Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    unitService.obtenerUnidadPorNombre.mockResolvedValueOnce(mockUnidad)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValueOnce(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValueOnce(mockSecciones)

    render(
      <BrowserRouter>
        <EditUnits isOpen={true} entityName="Unidad Administrativa" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Unidad/i })).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Unidad Administrativa')).toBeInTheDocument()
  })

  it('muestra cargando dentro del modal', () => {
    render(
      <BrowserRouter>
        <EditUnits isOpen={true} entityName="Test" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando unidad...')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    unitService.obtenerUnidadPorNombre.mockResolvedValueOnce(mockUnidad)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValueOnce(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValueOnce(mockSecciones)

    render(
      <BrowserRouter>
        <EditUnits isOpen={true} entityName="Unidad Administrativa" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Unidad Administrativa')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    unitService.obtenerUnidadPorNombre.mockResolvedValueOnce(mockUnidad)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValueOnce(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValueOnce(mockSecciones)
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <EditUnits isOpen={true} entityName="Unidad Administrativa" onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Unidad Administrativa')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('usa entityName prop en lugar de useParams', async () => {
    unitService.obtenerUnidadPorNombre.mockResolvedValueOnce(mockUnidad)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValueOnce(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValueOnce(mockSecciones)

    render(
      <BrowserRouter>
        <EditUnits isOpen={true} entityName="Unidad Administrativa" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(unitService.obtenerUnidadPorNombre).toHaveBeenCalledWith('Unidad Administrativa')
    })
  })
})
