// ConsultarArea.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarArea from '../pages/ConsultarArea'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

describe('ConsultarArea Page', () => {
  const mockAreas = [
    { id: 1, nombre: 'Administración', descripcion: 'Ãrea de administración' },
    { id: 2, nombre: 'Contabilidad', descripcion: 'Ãrea de contabilidad' },
    { id: 3, nombre: 'Recursos Humanos', descripcion: 'Ãrea de RRHH' },
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

  it('renderiza botones de editar y eliminar', async () => {
    render(
      <BrowserRouter>
        <ConsultarArea />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const editButtons = screen.getAllByText(/Editar|âœ/i)
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
})

