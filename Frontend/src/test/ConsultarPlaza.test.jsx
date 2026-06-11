// QueryPositions.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryPositions from '../pages/QueryPositions'
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

const mockPlazas = [
  { numeroPlaza: 1, idUnidad: 1, idDepartamento: 1, idSeccion: null, idArea: 1 },
  { numeroPlaza: 2, idUnidad: null, idDepartamento: null, idSeccion: 1, idArea: 1 },
  { numeroPlaza: 3, idUnidad: null, idDepartamento: null, idSeccion: null, idArea: null },
]
const mockUnidades = [{ id: 1, nombre: 'Administración', idArea: 1 }]
const mockDepartamentos = [{ id: 1, nombre: 'Compras', idArea: 1 }]
const mockSecciones = [{ id: 1, nombre: 'Soporte', idArea: 1 }]
const mockAreas = [{ id: 1, nombre: 'Central' }]

describe('QueryPositions Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    positionService.obtenerPlazas.mockResolvedValue(mockPlazas)
    unitService.obtenerUnidades.mockResolvedValue(mockUnidades)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('carga y renderiza plazas', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    expect(positionService.obtenerPlazas).toHaveBeenCalled()
  })

  it('renderiza tabla con las columnas correctas', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Número de Plaza')).toBeInTheDocument()
      expect(screen.getByText('Unidad')).toBeInTheDocument()
      expect(screen.getByText('Departamento/Sección')).toBeInTheDocument()
      expect(screen.getByText('Área')).toBeInTheDocument()
    })
  })

  it('resuelve etiquetas de unidad, departamento, sección y área', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unidad de Administración')).toBeInTheDocument()
      expect(screen.getByText('Departamento de Compras')).toBeInTheDocument()
      expect(screen.getByText('Sección de Soporte')).toBeInTheDocument()
    })
  })

  it('muestra "Sin asignación" cuando la plaza no tiene unidad ni área', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const sinAsignacion = screen.getAllByText('Sin asignación')
      expect(sinAsignacion.length).toBeGreaterThan(0)
    })
  })

  it('renderiza botones de editar', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /Editar/i })
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza footer', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('filtra plazas por número en el buscador', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: '1' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('1')
    })
  })

  it('muestra mensaje cuando no hay plazas', async () => {
    positionService.obtenerPlazas.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(positionService.obtenerPlazas).toHaveBeenCalled()
    })
  })

  it('llama a todos los servicios de organización al montar', async () => {
    render(
      <BrowserRouter>
        <QueryPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(unitService.obtenerUnidades).toHaveBeenCalled()
      expect(departmentService.obtenerDepartamentos).toHaveBeenCalled()
      expect(sectionService.obtenerSecciones).toHaveBeenCalled()
      expect(areaService.obtenerAreas).toHaveBeenCalled()
    })
  })
})
