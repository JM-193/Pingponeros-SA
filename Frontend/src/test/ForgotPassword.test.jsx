// ForgotPassword.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ForgotPassword from '../pages/ForgotPassword'
import * as authService from '../services/authService'

vi.mock('../services/authService')

const renderPage = () =>
  render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>,
  )

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza página de recuperación de contraseña', () => {
    renderPage()
    expect(screen.getByText(/Olvidó.*contraseña/i)).toBeInTheDocument()
  })

  it('muestra error cuando el correo está vacío', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
    })
  })

  it('muestra error de formato cuando el correo no cumple el patrón UCR', async () => {
    renderPage()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalido@gmail.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(
        screen.getByText(/El correo debe ser válido/i),
      ).toBeInTheDocument()
    })
  })

  it('aplica borde rojo al input cuando hay error de correo', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(screen.getByRole('textbox').style.border).toContain('2px solid')
    })
  })

  it('muestra mensaje de éxito tras envío correcto', async () => {
    authService.recuperarContrasena.mockResolvedValueOnce({})
    renderPage()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nombre.apellidos@ucr.ac.cr' } })
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(
        screen.getByText(/Si su correo está registrado/i),
      ).toBeInTheDocument()
    })
  })

  it('muestra error de submit cuando la API falla', async () => {
    authService.recuperarContrasena.mockRejectedValueOnce(new Error('Correo no encontrado'))
    renderPage()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nombre.apellidos@ucr.ac.cr' } })
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(screen.getByText('Correo no encontrado')).toBeInTheDocument()
    })
  })

  it('muestra bloqueo cuando la temporal vencida impide recuperación', async () => {
    authService.recuperarContrasena.mockRejectedValueOnce(
      new Error('La contraseña temporal ha expirado. Contacte al equipo de soporte para recuperar el acceso.'),
    )
    renderPage()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nombre.apellidos@ucr.ac.cr' } })
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(screen.getByText(/contraseña temporal ha expirado/i)).toBeInTheDocument()
    })
  })

  it('muestra estado de carga durante el envío', async () => {
    let resolveCall
    authService.recuperarContrasena.mockReturnValueOnce(
      new Promise((r) => { resolveCall = r }),
    )
    renderPage()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nombre.apellidos@ucr.ac.cr' } })
    fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enviando/i })).toBeInTheDocument()
    })
    await act(async () => { resolveCall({}) })
  })
})
