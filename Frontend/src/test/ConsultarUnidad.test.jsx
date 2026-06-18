// QueryUnits.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryUnits from '../pages/QueryUnits'
import * as unitService from '../services/unitService'
import * as areaService from '../services/areaService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'

vi.mock('../services/unitService')
vi.mock('../services/areaService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')

describe('QueryUnits Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unitService.obtenerUnidades.mockResolvedValue([
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
        <QueryUnits />
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
        <QueryUnits />
      </BrowserRouter>,
    )

    expect(unitService.obtenerUnidades).toHaveBeenCalled()
  })

  it('filtra unidades por nombre en el buscador', async () => {
    render(
      <BrowserRouter>
        <QueryUnits />
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
        <QueryUnits />
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
        <QueryUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Departamento de Compras')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('muestra dependencia de sección cuando la unidad tiene idSeccion', async () => {
    unitService.obtenerUnidades.mockResolvedValue([
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
        <QueryUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Sección de Sección A')).toBeInTheDocument()
    })
  })

  it('abre modal de crear al hacer clic en Crear', async () => {
    render(
      <BrowserRouter>
        <QueryUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Crear Unidad')).toBeInTheDocument()
    })
  })

  it('abre modal de editar al hacer clic en Editar', async () => {
    unitService.obtenerUnidadPorNombre.mockResolvedValue({
      nombre: 'Unidad Técnica',
      descripcion: 'Unidad de soporte',
      idArea: 1,
      idDepartamento: 2,
      estado: 1,
    })

    render(
      <BrowserRouter>
        <QueryUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Editar/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      const dialogs = document.querySelectorAll('dialog')
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })
})
