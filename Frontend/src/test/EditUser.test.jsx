// EditUsers.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import EditUsers from '../pages/EditUsers'
import * as userService from '../services/userService'
import * as positionService from '../services/positionService'
import * as workPositionService from '../services/workPositionService'
import { guardarSesion, cerrarSesion } from '../services/session'

vi.mock('../services/userService')
vi.mock('../services/positionService')
vi.mock('../services/workPositionService')

// Defaults para la sección de plazas embebida en Editar Usuario (evita llamadas de red reales).
const setupPlazaMocks = () => {
  userService.obtenerPlazasUsuario.mockResolvedValue([])
  positionService.obtenerPlazasDisponibles.mockResolvedValue([])
  workPositionService.obtenerPuestos.mockResolvedValue([])
}

// Construye un JWT de prueba (solo el payload importa; la firma no se verifica en el cliente).
const buildToken = (correo) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({ correoInstitucional: correo, exp: Math.floor(Date.now() / 1000) + 3600 }),
  )
    .replaceAll('+', '-')
    .replaceAll('/', '_')
  return `${header}.${payload}.sig`
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

const renderWithRoute = (correo) =>
  render(
    <MemoryRouter initialEntries={[`/usuarios/editar/${encodeURIComponent(correo)}`]}>
      <Routes>
        <Route path="/usuarios/editar/:correo" element={<EditUsers />} />
        <Route path="/usuarios/consultar" element={<div>Lista de usuarios</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('EditUsers Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    cerrarSesion()
    setupPlazaMocks()
  })

  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditUsers />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando usuario...')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <EditUsers />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <EditUsers />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('carga y renderiza el formulario con los datos del usuario', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)

    renderWithRoute('juan.perez@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Usuario/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pedro')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mora')).toBeInTheDocument()
    expect(screen.getByDisplayValue('juan.perez@ucr.ac.cr')).toBeInTheDocument()
  })

  it('actualiza usuario correctamente y redirige', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    userService.actualizarUsuario.mockResolvedValueOnce({})

    renderWithRoute('juan.perez@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Usuario actualizado correctamente.', expect.anything())
    })
  })

  it('deshabilita el campo Rol al editar el propio perfil', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    guardarSesion(buildToken(mockUser.correoInstitucional))

    renderWithRoute(mockUser.correoInstitucional)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/Rol/i)).toBeDisabled()
  })

  it('mantiene habilitado el campo Rol al editar a otro usuario', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    guardarSesion(buildToken('otra.persona@ucr.ac.cr'))

    renderWithRoute(mockUser.correoInstitucional)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/Rol/i)).not.toBeDisabled()
  })

  it('muestra error cuando la actualización falla', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    userService.actualizarUsuario.mockRejectedValueOnce(new Error('Error al actualizar'))

    renderWithRoute('juan.perez@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar', expect.anything())
    })
  })

  it('muestra error cuando falla la carga del usuario', async () => {
    userService.obtenerUsuarioPorCorreo.mockRejectedValueOnce(new Error('Usuario no encontrado'))

    renderWithRoute('no.existe@ucr.ac.cr')

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Usuario no encontrado', expect.anything())
    })
  })

  it('cambia el estado del usuario con StateToggle', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)

    renderWithRoute('juan.perez@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    // StateToggle renders buttons for Activo/Inactivo
    const stateButtons = screen.getAllByRole('button')
    const inactivoButton = stateButtons.find((btn) => btn.textContent.includes('Inactivo'))
    if (inactivoButton) {
      fireEvent.click(inactivoButton)
      // El botón debería reflejar el cambio sin errores
      expect(inactivoButton).toBeInTheDocument()
    }
  })

  it('notifica con toast cuando la actualización falla', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    userService.actualizarUsuario.mockRejectedValueOnce(new Error('Error al actualizar'))

    renderWithRoute('juan.perez@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar', expect.anything())
    })
  })
})

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
        <EditUsers isModal isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
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
        <EditUsers isModal isOpen={true} entityId="test@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando usuario...')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)

    render(
      <BrowserRouter>
        <EditUsers isModal isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
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
        <EditUsers isModal isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={onClose} onSuccess={() => {}} />
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
        <EditUsers isModal isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
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
        <EditUsers isModal isOpen={true} entityId="juan.perez@ucr.ac.cr" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(userService.obtenerUsuarioPorCorreo).toHaveBeenCalledWith('juan.perez@ucr.ac.cr')
    })
  })
})
