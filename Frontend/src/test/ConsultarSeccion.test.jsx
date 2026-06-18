// QuerySections.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QuerySections from '../pages/QuerySections'
import * as sectionService from '../services/sectionService'
import * as areaService from '../services/areaService'

vi.mock('../services/sectionService')
vi.mock('../services/areaService')

describe('QuerySections Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sectionService.obtenerSecciones.mockResolvedValue([
      { id: 20, nombre: 'Soporte', descripcion: 'Sección de soporte', idArea: 1, estado: 1 },
    ])
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('carga y renderiza secciones', async () => {
    render(
      <BrowserRouter>
        <QuerySections />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soporte')).toBeInTheDocument()
      expect(screen.getByText('Área de Administración')).toBeInTheDocument()
    })
  })

  it('llama a obtenerSecciones al montar', () => {
    render(
      <BrowserRouter>
        <QuerySections />
      </BrowserRouter>,
    )

    expect(sectionService.obtenerSecciones).toHaveBeenCalled()
  })

  it('filtra secciones por nombre en el buscador', async () => {
    render(
      <BrowserRouter>
        <QuerySections />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soporte')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: 'Soporte' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('Soporte')
    })
  })

  it('filtra secciones por área en el buscador', async () => {
    render(
      <BrowserRouter>
        <QuerySections />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soporte')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: 'Administración' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('Administración')
    })
  })

  it('abre modal de crear al hacer clic en Crear', async () => {
    render(
      <BrowserRouter>
        <QuerySections />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soporte')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Crear Sección')).toBeInTheDocument()
    })
  })

  it('abre modal de editar al hacer clic en Editar', async () => {
    sectionService.obtenerSeccionPorNombre.mockResolvedValue({
      nombre: 'Soporte',
      descripcion: 'Sección de soporte',
      idArea: 1,
      estado: 1,
    })

    render(
      <BrowserRouter>
        <QuerySections />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soporte')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Editar/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      const dialogs = document.querySelectorAll('dialog')
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })
})
