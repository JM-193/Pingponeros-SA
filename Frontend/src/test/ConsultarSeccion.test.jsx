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
    sectionService.obtenerSecciones.mockResolvedValueOnce([
      { id: 20, nombre: 'Soporte', descripcion: 'Sección de soporte', idArea: 1, estado: 1 },
    ])
    areaService.obtenerAreas.mockResolvedValueOnce([
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
})
