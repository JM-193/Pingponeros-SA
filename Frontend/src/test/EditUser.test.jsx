// EditUsers.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import EditUsers from '../pages/EditUsers'
import * as userService from '../services/userService'
import * as positionService from '../services/positionService'
import * as workPositionService from '../services/workPositionService'
import { cerrarSesion } from '../services/session'

vi.mock('../services/userService')
vi.mock('../services/positionService')
vi.mock('../services/workPositionService')

// Defaults para la sección de plazas embebida en Editar Usuario (evita llamadas de red reales).
const setupPlazaMocks = () => {
  userService.obtenerPlazasUsuario.mockResolvedValue([])
  positionService.obtenerPlazasDisponibles.mockResolvedValue([])
  workPositionService.obtenerPuestos.mockResolvedValue([])
}

const mockUser = {
  correoInstitucional: 'juan.perez@ucr.ac.cr',
  primerNombre: 'Juan',
  segundoNombre: 'Pedro',
  primerApellido: 'Pérez',
  segundoApellido: 'Mora',
  rol: 1,
  estado: 1,
}


describe('EditUsers Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    cerrarSesion()
    setupPlazaMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)

    render(
      <BrowserRouter>
        <EditUsers isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Usuario')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
  })

  it('muestra cargando dentro del modal', () => {
    render(
      <BrowserRouter>
        <EditUsers isOpen={true} entityId="test@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando usuario...')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)

    render(
      <BrowserRouter>
        <EditUsers isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <EditUsers isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    userService.actualizarUsuario.mockResolvedValueOnce({})

    render(
      <BrowserRouter>
        <EditUsers isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Usuario actualizado correctamente.', expect.anything())
    })

    expect(userService.actualizarUsuario).toHaveBeenCalled()
  })

  it('usa entityId prop en lugar de useParams', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValue(mockUser)

    render(
      <BrowserRouter>
        <EditUsers isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(userService.obtenerUsuarioPorCorreo).toHaveBeenCalledWith('juan.perez@ucr.ac.cr')
    })
  })
})
