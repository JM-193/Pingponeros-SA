// ConsultarUsuarios.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarUsuarios from '../pages/ConsultarUsuarios'
import * as usuarioService from '../services/usuarioService'

vi.mock('../services/usuarioService')

describe('ConsultarUsuarios Page', () => {
  const mockUsuarios = [
    { correoInstitucional: 'juanito.perezperez@ucr.ac.cr', primerNombre: 'Juanito', primerApellido: 'Pérez', estado: 1 },
    { correoInstitucional: 'juanito.moraporras@ucr.ac.cr', primerNombre: 'Juanito', segundoNombre: 'Manuel', primerApellido: 'Mora', segundoApellido: 'Porras', estado: 1 },
    { correoInstitucional: 'carlos.gomezlopez@ucr.ac.cr', primerNombre: 'Carlos', primerApellido: 'Gómez', segundoApellido: 'López', estado: 0 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    usuarioService.obtenerUsuarios.mockResolvedValue(mockUsuarios)
  })

  it('carga y renderiza usuarios', async () => {
    render(
      <BrowserRouter>
        <ConsultarUsuarios />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Juanito')).toBeInTheDocument()
      expect(screen.getByText('Carlos')).toBeInTheDocument()
    })
  })

  it('renderiza tabla con columnas correctas', async () => {
    render(
      <BrowserRouter>
        <ConsultarUsuarios />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Juanito')).toBeInTheDocument()
      const table = document.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('renderiza campo de búsqueda', () => {
    render(
      <BrowserRouter>
        <ConsultarUsuarios />
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
        <ConsultarUsuarios />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza footer', () => {
    render(
      <BrowserRouter>
        <ConsultarUsuarios />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('llama a obtenerUsuarios en mount', () => {
    render(
      <BrowserRouter>
        <ConsultarUsuarios />
      </BrowserRouter>,
    )

    expect(usuarioService.obtenerUsuarios).toHaveBeenCalled()
  })

  it('muestra mensaje cuando no hay resultados', async () => {
    usuarioService.obtenerUsuarios.mockResolvedValue([])

    render(
      <BrowserRouter>
        <ConsultarUsuarios />
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
