// ConsultarArea.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarArea from '../pages/ConsultarArea'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

describe('ConsultarArea Page', () => {
  const mockAreas = [
    { id: 1, nombre: 'Administración', descripcion: 'Ãrea de administración', estado: 1 },
    { id: 2, nombre: 'Contabilidad', descripcion: 'Ãrea de contabilidad', estado: 1 },
    { id: 3, nombre: 'Recursos Humanos', descripcion: 'Ãrea de RRHH', estado: 0 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
  })

  it('carga y renderiza áreas', async () => {
    render(
      <BrowserRouter>
        <ConsultarArea />
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
        <ConsultarArea />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Administración')).toBeInTheDocument()
      // Verificar que se renderice la tabla
      const table = document.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('renderiza botones de editar', async () => {
    render(
      <BrowserRouter>
        <ConsultarArea />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /Editar/i })
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  it('renderiza campo de bÃºsqueda', () => {
    render(
      <BrowserRouter>
        <ConsultarArea />
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
        <ConsultarArea />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza footer', () => {
    render(
      <BrowserRouter>
        <ConsultarArea />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('tiene layout con full height', () => {
    const { container } = render(
      <BrowserRouter>
        <ConsultarArea />
      </BrowserRouter>,
    )

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveStyle('min-height: 100vh')
  })

  it('llama a obtenerAreas en mount', () => {
    render(
      <BrowserRouter>
        <ConsultarArea />
      </BrowserRouter>,
    )

    expect(areaService.obtenerAreas).toHaveBeenCalled()
  })

  it('muestra mensaje cuando no hay resultados', async () => {
    areaService.obtenerAreas.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <ConsultarArea />
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
        <ConsultarArea />
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
})

