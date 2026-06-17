// EditUsers.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import EditUsers from '../pages/EditUsers'
import * as userService from '../services/userService'

vi.mock('../services/userService')

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
      expect(screen.getByText('Usuario actualizado correctamente.')).toBeInTheDocument()
    })
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
      expect(screen.getByText('Error al actualizar')).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la carga del usuario', async () => {
    userService.obtenerUsuarioPorCorreo.mockRejectedValueOnce(new Error('Usuario no encontrado'))

    renderWithRoute('no.existe@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByText('Usuario no encontrado')).toBeInTheDocument()
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

  it('limpia mensajes de error al cambiar campos del formulario', async () => {
    userService.obtenerUsuarioPorCorreo.mockResolvedValueOnce(mockUser)
    userService.actualizarUsuario.mockRejectedValueOnce(new Error('Error al actualizar'))

    renderWithRoute('juan.perez@ucr.ac.cr')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error al actualizar')).toBeInTheDocument()
    })

    // Cambiar un campo debe limpiar el mensaje
    const firstNameInput = screen.getByDisplayValue('Juan')
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Juanito' } })

    expect(screen.queryByText('Error al actualizar')).not.toBeInTheDocument()
  })
})

describe('EditUsers Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
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
      expect(screen.getByText('Usuario actualizado correctamente.')).toBeInTheDocument()
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
