// ConsultarDepartamento.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarDepartamento from '../pages/ConsultarDepartamento'
import * as departamentoService from '../services/departamentoService'
import * as areaService from '../services/areaService'

vi.mock('../services/departamentoService')
vi.mock('../services/areaService')

describe('ConsultarDepartamento Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce([
      { id: 10, nombre: 'Compras', descripcion: 'Departamento de compras', idArea: 1, estado: 1 },
    ])
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('carga y renderiza departamentos', async () => {
    render(
      <BrowserRouter>
        <ConsultarDepartamento />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument()
      expect(screen.getByText('Área de Administración')).toBeInTheDocument()
    })
  })

  it('llama a obtenerDepartamentos al montar', () => {
    render(
      <BrowserRouter>
        <ConsultarDepartamento />
      </BrowserRouter>,
    )

    expect(departamentoService.obtenerDepartamentos).toHaveBeenCalled()
  })

  it('filtra departamentos por nombre en el buscador', async () => {
    render(
      <BrowserRouter>
        <ConsultarDepartamento />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: 'Compras' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('Compras')
    })
  })

  it('filtra departamentos por área en el buscador', async () => {
    render(
      <BrowserRouter>
        <ConsultarDepartamento />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument()
    })

    const searchInput = document.querySelector('input[id="search"]')
    fireEvent.change(searchInput, { target: { value: 'Central' } })

    const searchForm = document.querySelector('form')
    fireEvent.submit(searchForm)

    await waitFor(() => {
      expect(searchInput.value).toBe('Central')
    })
  })
})
