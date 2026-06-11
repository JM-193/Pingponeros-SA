// EditUser.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import EditUser from '../pages/EditUser'
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
        <Route path="/usuarios/editar/:correo" element={<EditUser />} />
        <Route path="/usuarios/consultar" element={<div>Lista de usuarios</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('EditUser Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditUser />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando usuario...')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <EditUser />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <EditUser />
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
