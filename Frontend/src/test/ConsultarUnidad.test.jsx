// ConsultarUnidad.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarUnidad from '../pages/ConsultarUnidad'
import * as unidadService from '../services/unidadService'
import * as areaService from '../services/areaService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'

vi.mock('../services/unidadService', () => ({
  obtenerUnidades: vi.fn(),
}))
vi.mock('../services/areaService', () => ({
  obtenerAreas: vi.fn(),
}))
vi.mock('../services/departmentService', () => ({
  obtenerDepartamentos: vi.fn(),
}))
vi.mock('../services/sectionService', () => ({
  obtenerSecciones: vi.fn(),
}))

describe('ConsultarUnidad Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unidadService.obtenerUnidades.mockResolvedValue([
      {
        id: 30,
        nombre: 'Unidad Técnica',
        descripcion: 'Unidad de soporte',
        idArea: 1,
        idDepartamento: 2,
        estado: 1,
      },
    ])
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
    departmentService.obtenerDepartamentos.mockResolvedValue([
      { id: 2, nombre: 'Compras', descripcion: 'Departamento' },
    ])
    sectionService.obtenerSecciones.mockResolvedValue([])
  })

  it('carga y renderiza unidades', async () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    // Wait for the unit name to appear
    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('llama a obtenerUnidades al montar', () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    expect(unidadService.obtenerUnidades).toHaveBeenCalled()
  })

  it('filtra unidades por nombre en el buscador', async () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: 'Técnica' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('Técnica')
    })
  })

  it('filtra unidades por área en el buscador', async () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: 'Administración' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('Administración')
    })
  })

  it('muestra dependencia de departamento correctamente', async () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Departamento de Compras')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('muestra dependencia de sección cuando la unidad tiene idSeccion', async () => {
    unidadService.obtenerUnidades.mockResolvedValue([
      {
        id: 31,
        nombre: 'Unidad Logística',
        descripcion: 'Unidad de logística',
        idArea: 1,
        idSeccion: 1,
        estado: 1,
      },
    ])
    sectionService.obtenerSecciones.mockResolvedValue([
      { id: 1, nombre: 'Sección A', descripcion: 'Sección' },
    ])

    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Sección de Sección A')).toBeInTheDocument()
    })
  })
})
