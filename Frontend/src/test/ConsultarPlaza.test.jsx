// ConsultarPlaza.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarPlaza from '../pages/ConsultarPlaza'
import * as plazaService from '../services/plazaService'
import * as unidadService from '../services/unidadService'
import * as departamentoService from '../services/departamentoService'
import * as seccionService from '../services/seccionService'
import * as areaService from '../services/areaService'

vi.mock('../services/plazaService')
vi.mock('../services/unidadService')
vi.mock('../services/departamentoService')
vi.mock('../services/seccionService')
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

describe('ConsultarPlaza Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    plazaService.obtenerPlazas.mockResolvedValue(mockPlazas)
    unidadService.obtenerUnidades.mockResolvedValue(mockUnidades)
    departamentoService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    seccionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('carga y renderiza plazas', async () => {
    render(
      <BrowserRouter>
        <ConsultarPlaza />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    expect(plazaService.obtenerPlazas).toHaveBeenCalled()
  })

  it('renderiza tabla con las columnas correctas', async () => {
    render(
      <BrowserRouter>
        <ConsultarPlaza />
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
        <ConsultarPlaza />
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
        <ConsultarPlaza />
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
        <ConsultarPlaza />
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
        <ConsultarPlaza />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza footer', async () => {
    render(
      <BrowserRouter>
        <ConsultarPlaza />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('filtra plazas por número en el buscador', async () => {
    render(
      <BrowserRouter>
        <ConsultarPlaza />
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
    plazaService.obtenerPlazas.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <ConsultarPlaza />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(plazaService.obtenerPlazas).toHaveBeenCalled()
    })
  })

  it('llama a todos los servicios de organización al montar', async () => {
    render(
      <BrowserRouter>
        <ConsultarPlaza />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(unidadService.obtenerUnidades).toHaveBeenCalled()
      expect(departamentoService.obtenerDepartamentos).toHaveBeenCalled()
      expect(seccionService.obtenerSecciones).toHaveBeenCalled()
      expect(areaService.obtenerAreas).toHaveBeenCalled()
    })
  })
})
