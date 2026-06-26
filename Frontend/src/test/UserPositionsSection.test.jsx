// UserPositionsSection.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'react-toastify'
import UserPositionsSection from '../components/UserPositionsSection'
import * as userService from '../services/userService'
import * as positionService from '../services/positionService'
import * as workPositionService from '../services/workPositionService'

vi.mock('../services/userService')
vi.mock('../services/positionService')
vi.mock('../services/workPositionService')

const CORREO = 'ana.lopez@ucr.ac.cr'

const asignacion = {
  numeroPlaza: 1001,
  correoInstitucional: CORREO,
  idPuesto: 5,
  puestoNombre: 'Analista',
  claseOcupacional: 'Profesional 1',
  fechaInicio: '2026-01-01T00:00:00',
  fechaFinal: null,
}

const disponibles = [{ numeroPlaza: 2001 }, { numeroPlaza: 2002 }]
const puestos = [
  { id: 5, nombre: 'Analista' },
  { id: 6, nombre: 'Asistente' },
]

describe('UserPositionsSection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    userService.obtenerPlazasUsuario.mockResolvedValue([])
    userService.asignarPlazaUsuario.mockResolvedValue({})
    userService.desasignarPlazaUsuario.mockResolvedValue({})
    positionService.obtenerPlazasDisponibles.mockResolvedValue(disponibles)
    workPositionService.obtenerPuestos.mockResolvedValue(puestos)
  })

  it('muestra mensaje cuando el usuario no tiene plazas', async () => {
    render(<UserPositionsSection correo={CORREO} />)

    await waitFor(() => {
      expect(screen.getByText('Este usuario no tiene plazas asignadas.')).toBeInTheDocument()
    })
  })

  it('renderiza la tabla con las plazas asignadas', async () => {
    userService.obtenerPlazasUsuario.mockResolvedValue([asignacion])
    // Sin puestos en el dropdown para que "Analista" sea único (solo la fila de la tabla).
    workPositionService.obtenerPuestos.mockResolvedValue([])

    render(<UserPositionsSection correo={CORREO} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })
    expect(screen.getByText('Analista')).toBeInTheDocument()
    expect(screen.getByText('Profesional 1')).toBeInTheDocument()
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()
  })

  it('vincula una plaza llamando al servicio con el payload correcto', async () => {
    render(<UserPositionsSection correo={CORREO} />)

    await waitFor(() => {
      expect(workPositionService.obtenerPuestos).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByLabelText(/Plaza disponible/i), { target: { value: '2001' } })
    fireEvent.change(screen.getByLabelText(/Puesto/i), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText(/Clase Ocupacional/i), { target: { value: 'Profesional 1' } })
    fireEvent.change(screen.getByLabelText(/Fecha Inicio/i), { target: { value: '2026-01-01' } })

    fireEvent.click(screen.getByRole('button', { name: /Agregar/i }))

    await waitFor(() => {
      expect(userService.asignarPlazaUsuario).toHaveBeenCalledWith(CORREO, {
        numeroPlaza: 2001,
        idPuesto: 5,
        claseOcupacional: 'Profesional 1',
        fechaInicio: '2026-01-01',
        fechaFinal: null,
      })
    })
    expect(toast.success).toHaveBeenCalled()
  })

  it('no llama al servicio si faltan campos obligatorios', async () => {
    render(<UserPositionsSection correo={CORREO} />)

    await waitFor(() => {
      expect(workPositionService.obtenerPuestos).toHaveBeenCalled()
    })

    // Solo se elige plaza; faltan puesto, clase y fecha de inicio.
    fireEvent.change(screen.getByLabelText(/Plaza disponible/i), { target: { value: '2001' } })
    fireEvent.click(screen.getByRole('button', { name: /Agregar/i }))

    await waitFor(() => {
      expect(screen.getByText('La clase ocupacional es obligatoria')).toBeInTheDocument()
    })
    expect(userService.asignarPlazaUsuario).not.toHaveBeenCalled()
  })

  it('desvincula una plaza tras confirmar', async () => {
    userService.obtenerPlazasUsuario.mockResolvedValue([asignacion])

    render(<UserPositionsSection correo={CORREO} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => {
      expect(userService.desasignarPlazaUsuario).toHaveBeenCalledWith(CORREO, 1001)
    })
    expect(toast.success).toHaveBeenCalled()
  })
})
