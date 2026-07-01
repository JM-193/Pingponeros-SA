// Declarations.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Declarations from '../pages/Declarations'
import * as session from '../services/session'
import * as declarationService from '../services/declarationService'

vi.mock('../services/session')
vi.mock('../services/declarationService')

const mockSesion = { correoInstitucional: 'funcionario@ucr.ac.cr', rol: 0 }

describe('Declarations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue(mockSesion)
  })

  it('muestra estado de carga inicial', () => {
    declarationService.obtenerDeclaracionActiva.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    expect(screen.getByRole('button', { name: /Cargando/i })).toBeInTheDocument()
  })

  it('muestra botón "Iniciar Declaración" cuando no hay declaración activa', async () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Iniciar Declaración/i })).toBeInTheDocument()
    })
  })

  it('muestra botón "Continuar Declaración" cuando hay una declaración activa', async () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue({
      declaracion: { id: 1, numeroPlaza: 100, completa: 0 },
    })

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Continuar Declaración/i })).toBeInTheDocument()
    })
  })

  it('renderiza el aviso importante', async () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Aviso Importante/i)).toBeInTheDocument()
    })
  })

  it('renderiza el título principal', async () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Declaración Jurada del Puesto de Trabajo/i)).toBeInTheDocument()
    })
  })

  it('llama a obtenerDeclaracionActiva con el correo de la sesión', () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    expect(declarationService.obtenerDeclaracionActiva).toHaveBeenCalledWith('funcionario@ucr.ac.cr')
  })

  it('muestra mensaje sobre declaración única activa', async () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Solo puede tener una declaración activa a la vez/i)).toBeInTheDocument()
    })
  })

  it('muestra subtítulo de Vicerrectoría', async () => {
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Declarations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Vicerrectoría de Administración/i)).toBeInTheDocument()
    })
  })
})
