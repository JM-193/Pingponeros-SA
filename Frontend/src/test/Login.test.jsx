// Login.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import * as authService from '../services/authService'
import * as sessionService from '../services/session'

vi.mock('../services/authService')
vi.mock('../services/session')

describe('Login Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza formulario de login', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    expect(screen.getByLabelText('Correo Institucional')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar Sesión|Verificando/i })).toBeInTheDocument()
  })

  it('renderiza títulos correctos', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    expect(screen.getByText('Vicerrectoría de Administración')).toBeInTheDocument()
    expect(screen.getByText('Aplicación de Cargas de Trabajo')).toBeInTheDocument()
  })

  it('valida que correo sea requerido', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
    })
  })

  it('valida que contraseña sea requerida', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    const emailInput = screen.getByLabelText('Correo Institucional')
    fireEvent.change(emailInput, { target: { value: 'test.user@ucr.ac.cr' } })

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })

  it('valida formato de correo UCR', async () => {
    const { container } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    const emailInput = screen.getByLabelText('Correo Institucional')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const passwordInput = screen.getByLabelText('Contraseña')
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText((content) => content.startsWith('El correo debe ser'))).toBeInTheDocument()
  })

  it('realiza login exitoso', async () => {
    // Login.jsx desestructura: const { token, ...usuario } = await login(...)
    // El mock debe devolver un objeto con { token, estado, ... }
    const mockToken = 'header.payload.signature'
    authService.login.mockResolvedValueOnce({
      token: mockToken,
      estado: 1,
      correoInstitucional: 'test.user@ucr.ac.cr',
    })
    sessionService.guardarSesion.mockImplementation(() => {})

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'test.user@ucr.ac.cr' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test.user@ucr.ac.cr', 'password123')
      expect(sessionService.guardarSesion).toHaveBeenCalledWith(mockToken)
    })
  })

  it('permite login con contraseña temporal vigente', async () => {
    // Login.jsx desestructura { token, ...usuario } y luego evalúa usuario.contrasenaTemporal
    const mockToken = 'header.temporalpayload.signature'
    authService.login.mockResolvedValueOnce({
      token: mockToken,
      estado: 1,
      contrasenaTemporal: true,
      fechaExpiracionContrasena: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // vigente
    })
    sessionService.guardarSesion.mockImplementation(() => {})

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'test.user@ucr.ac.cr' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Temporal123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(sessionService.guardarSesion).toHaveBeenCalledWith(mockToken)
    })
  })

  it('bloquea sesión cuando la contraseña temporal está vencida', async () => {
    authService.login.mockResolvedValueOnce({
      correoInstitucional: 'test.user@ucr.ac.cr',
      estado: 1,
      contrasenaTemporal: true,
      fechaExpiracionContrasena: new Date(Date.now() - 60 * 1000).toISOString(),
    })
    sessionService.guardarSesion.mockImplementation(() => {})

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'test.user@ucr.ac.cr' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Temporal123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/contraseña temporal ha expirado/i)).toBeInTheDocument()
      expect(sessionService.guardarSesion).not.toHaveBeenCalled()
    })
  })

  it('bloquea sesión cuando la cuenta está inactiva', async () => {
    authService.login.mockResolvedValueOnce({
      correoInstitucional: 'test.user@ucr.ac.cr',
      estado: 0,
    })
    sessionService.guardarSesion.mockImplementation(() => {})

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'test.user@ucr.ac.cr' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/cuenta de usuario se encuentra inactiva/i)).toBeInTheDocument()
      expect(sessionService.guardarSesion).not.toHaveBeenCalled()
    })
  })

  it('muestra error del servidor', async () => {
    authService.login.mockRejectedValueOnce(new Error('Usuario no encontrado'))

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'test.user@ucr.ac.cr' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Usuario no encontrado'))).toBeInTheDocument()
    })
  })

  it('convierte email a minúsculas', async () => {
    authService.login.mockResolvedValueOnce({ token: 'header.payload.signature', estado: 1 })
    sessionService.guardarSesion.mockImplementation(() => {})

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'TEST.USER@UCR.AC.CR' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'pass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test.user@ucr.ac.cr', 'pass')
    })
  })

  it('correo de error se limpia al reenviar con datos válidos', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    )

    // Primer submit sin datos: aparece error de correo
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
    })

    // Completar correo válido y volver a enviar: error de correo desaparece
    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'test.user@ucr.ac.cr' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('El correo es requerido')).not.toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })
})
