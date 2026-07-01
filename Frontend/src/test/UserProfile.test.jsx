// UserProfile.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import UserProfile from '../pages/UserProfile'
import * as session from '../services/session'
import * as userService from '../services/userService'

vi.mock('../services/session')
vi.mock('../services/userService')

const mockSesion = {
  correoInstitucional: 'ana@ucr.ac.cr',
  primerNombre: 'Ana',
  segundoNombre: 'María',
  primerApellido: 'Pérez',
  segundoApellido: 'Soto',
  rol: 0,
}

const mockPlazas = [
  {
    numeroPlaza: 1001,
    puestoNombre: 'Analista',
    claseOcupacionalNombre: 'Profesional 1',
    lugarTrabajo: 'Oficina Central',
    fechaInicio: '2026-01-01T00:00:00',
    fechaFinal: null,
  },
  {
    numeroPlaza: 1002,
    idPuesto: 7,
    puestoNombre: null,
    claseOcupacionalNombre: 'Técnico',
    lugarTrabajo: 'Sucursal Norte',
    fechaInicio: '2026-02-01T00:00:00',
    fechaFinal: '2026-06-01T00:00:00',
  },
]

describe('UserProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue(mockSesion)
  })

  it('muestra el estado de carga inicial', () => {
    userService.obtenerPlazasUsuario.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando plazas...')).toBeInTheDocument()
  })

  it('muestra la información personal de la sesión', async () => {
    userService.obtenerPlazasUsuario.mockResolvedValue([])

    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>,
    )

    expect(screen.getByText('Ana María Pérez Soto')).toBeInTheDocument()
    expect(screen.getByText('ana@ucr.ac.cr')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('No tiene plazas asignadas.')).toBeInTheDocument()
    })
  })

  it('renderiza la tabla de plazas asignadas', async () => {
    userService.obtenerPlazasUsuario.mockResolvedValue(mockPlazas)

    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Analista')).toBeInTheDocument()
    })
    expect(screen.getByText('Profesional 1')).toBeInTheDocument()
    expect(screen.getByText('Oficina Central')).toBeInTheDocument()
    // Fecha formateada a YYYY-MM-DD.
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()
    // Fecha final nula se muestra como guion largo.
    expect(screen.getByText('Técnico')).toBeInTheDocument()
    // Cuando no hay nombre de puesto, se usa el idPuesto.
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('llama a obtenerPlazasUsuario con el correo de la sesión', async () => {
    userService.obtenerPlazasUsuario.mockResolvedValue([])

    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(userService.obtenerPlazasUsuario).toHaveBeenCalledWith('ana@ucr.ac.cr')
    })
  })

  it('muestra un mensaje de error cuando la carga falla', async () => {
    userService.obtenerPlazasUsuario.mockRejectedValue(
      Object.assign(new Error('fallo'), { status: 500 }),
    )

    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getByText('No fue posible cargar las plazas. Intente de nuevo más tarde.'),
      ).toBeInTheDocument()
    })
  })

  it('no consulta plazas cuando no hay correo en la sesión', () => {
    session.obtenerSesion.mockReturnValue(null)
    userService.obtenerPlazasUsuario.mockResolvedValue([])

    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>,
    )

    expect(userService.obtenerPlazasUsuario).not.toHaveBeenCalled()
    // Sin datos personales se muestran los marcadores de posición.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
