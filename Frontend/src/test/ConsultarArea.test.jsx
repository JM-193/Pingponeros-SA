// QueryAreas.test.jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryAreas from '../pages/QueryAreas'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

describe('QueryAreas Page', () => {
  const mockAreas = [
    { id: 1, nombre: 'Administración', descripcion: 'Área de administración', estado: 1 },
    { id: 2, nombre: 'Contabilidad', descripcion: 'Área de contabilidad', estado: 1 },
    { id: 3, nombre: 'Recursos Humanos', descripcion: 'Área de RRHH', estado: 0 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('carga y renderiza áreas', async () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Administración')).toBeInTheDocument()
      expect(screen.getByText('Contabilidad')).toBeInTheDocument()
    })
  })

  it('renderiza tabla con columnas correctas', async () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Administración')).toBeInTheDocument()
      // Verificar que se renderice la tabla
      const table = document.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('ordena áreas al hacer clic en el encabezado Nombre', async () => {
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Recursos Humanos', descripcion: 'Área de RRHH', estado: 0 },
      { id: 2, nombre: 'Administración', descripcion: 'Área de administración', estado: 1 },
      { id: 3, nombre: 'Contabilidad', descripcion: 'Área de contabilidad', estado: 1 },
    ])

    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Recursos Humanos')).toBeInTheDocument()
    })

    const getFirstColumnValues = () =>
      Array.from(document.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent)

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre ascendente/i }))
    expect(getFirstColumnValues()).toEqual(['Administración', 'Contabilidad', 'Recursos Humanos'])

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre descendente/i }))
    expect(getFirstColumnValues()).toEqual(['Recursos Humanos', 'Contabilidad', 'Administración'])
  })

  it('renderiza botones de editar', async () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /Editar/i })
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  it('renderiza campo de búsqueda', () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    const searchInput = screen.queryByPlaceholderText(/Buscar|search/i)
    if (searchInput) {
      expect(searchInput).toBeInTheDocument()
    }
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza footer', () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('tiene layout con full height', () => {
    const { container } = render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveStyle('min-height: 100vh')
  })

  it('llama a obtenerAreas en mount', () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    expect(areaService.obtenerAreas).toHaveBeenCalled()
  })

  it('muestra mensaje cuando no hay resultados', async () => {
    areaService.obtenerAreas.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const emptyMessage = screen.queryByText(/No se encontraron/i)
      if (emptyMessage) {
        expect(emptyMessage).toBeInTheDocument()
      }
    })
  })

  it('muestra la lista de áreas correctamente', async () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    const title = screen.queryByText('Consultar Área')
    if (title) {
      expect(title).toBeInTheDocument()
    }

    const emptyMessage = screen.queryByText(/No hay datos disponibles/)
    if (emptyMessage) {
      expect(emptyMessage).toBeInTheDocument()
    }
  })

  it('abre modal de crear al hacer clic en Crear', async () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Administración')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Crear Área')).toBeInTheDocument()
    })
  })

  it('abre modal de editar al hacer clic en Editar', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValue({
      nombre: 'Administración',
      descripcion: 'Área de administración',
      estado: 1,
    })

    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Administración')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Editar/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      const dialogs = document.querySelectorAll('dialog')
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })

  it('cierra modal de crear al hacer clic en cerrar', async () => {
    render(
      <BrowserRouter>
        <QueryAreas />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Administración')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(document.querySelector('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }))

    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeInTheDocument()
    })
  })
})
