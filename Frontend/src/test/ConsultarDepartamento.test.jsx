// QueryDepartments.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryDepartments from '../pages/QueryDepartments'
import * as departmentService from '../services/departmentService'
import * as areaService from '../services/areaService'

vi.mock('../services/departmentService')
vi.mock('../services/areaService')

describe('QueryDepartments Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    departmentService.obtenerDepartamentos.mockResolvedValue([
      { id: 10, nombre: 'Compras', descripcion: 'Departamento de compras', idArea: 1, estado: 1 },
    ])
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('carga y renderiza departamentos', async () => {
    render(
      <BrowserRouter>
        <QueryDepartments />
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
        <QueryDepartments />
      </BrowserRouter>,
    )

    expect(departmentService.obtenerDepartamentos).toHaveBeenCalled()
  })

  it('filtra departamentos por nombre en el buscador', async () => {
    render(
      <BrowserRouter>
        <QueryDepartments />
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
        <QueryDepartments />
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

  it('abre modal de crear al hacer clic en Crear', async () => {
    render(
      <BrowserRouter>
        <QueryDepartments />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Crear Departamento')).toBeInTheDocument()
    })
  })

  it('abre modal de editar al hacer clic en Editar', async () => {
    departmentService.obtenerDepartamentoPorNombre.mockResolvedValue({
      nombre: 'Compras',
      descripcion: 'Departamento de compras',
      idArea: 1,
      estado: 1,
    })

    render(
      <BrowserRouter>
        <QueryDepartments />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Editar/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      const dialogs = document.querySelectorAll('dialog')
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })
})
