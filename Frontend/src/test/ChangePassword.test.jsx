// ChangePassword.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChangePassword from '../pages/ChangePassword'
import * as authService from '../services/authService'
import * as sessionService from '../services/session'

vi.mock('../services/authService')
vi.mock('../services/session')

const renderPage = () =>
  render(
    <BrowserRouter>
      <ChangePassword />
    </BrowserRouter>,
  )

describe('ChangePassword Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionService.obtenerSesion.mockReturnValue({ correoInstitucional: 'test@ucr.ac.cr' })
  })

  it('renderiza el formulario de cambio de contraseña', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /Cambiar Contraseña/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingresa tu contraseña actual')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingresa tu nueva contraseña')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirma tu nueva contraseña')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    renderPage()

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza Footer', () => {
    renderPage()

    expect(document.querySelector('footer')).toBeInTheDocument()
  })

  it('renderiza botón de Cambiar Contraseña', () => {
    renderPage()

    expect(screen.getByRole('button', { name: /Cambiar Contraseña/i })).toBeInTheDocument()
  })

  it('renderiza botón de Cancelar', () => {
    renderPage()

    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('muestra error cuando contraseña actual está vacía', async () => {
    renderPage()

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('La contraseña actual es requerida')).toBeInTheDocument()
  })

  it('muestra error cuando nueva contraseña no cumple requisitos de complejidad', async () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña actual'), {
      target: { value: 'OldPass1!@' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
      target: { value: 'simple' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirma tu nueva contraseña'), {
      target: { value: 'simple' },
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText(/mínimo 12 caracteres/i)).toBeInTheDocument()
  })

  it('muestra error cuando las contraseñas no coinciden', async () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña actual'), {
      target: { value: 'OldPass1!@' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirma tu nueva contraseña'), {
      target: { value: 'DifferentPass1!' },
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('muestra error cuando nueva contraseña es igual a la actual', async () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña actual'), {
      target: { value: 'SamePass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
      target: { value: 'SamePass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirma tu nueva contraseña'), {
      target: { value: 'SamePass12345!' },
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('La nueva contraseña debe ser diferente a la actual')).toBeInTheDocument()
  })

  it('muestra mensaje de éxito tras cambio exitoso', async () => {
    authService.cambiarContrasena.mockResolvedValueOnce({})

    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña actual'), {
      target: { value: 'OldPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirma tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })

    const form = document.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Contraseña Actualizada')).toBeInTheDocument()
    })
  })

  it('muestra error de submit cuando la API falla', async () => {
    authService.cambiarContrasena.mockRejectedValueOnce(new Error('Contraseña incorrecta'))

    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña actual'), {
      target: { value: 'OldPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirma tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText('Contraseña incorrecta')).toBeInTheDocument()
    })
  })

  it('muestra estado de carga durante el envío', async () => {
    let resolveCall
    authService.cambiarContrasena.mockReturnValueOnce(
      new Promise((r) => { resolveCall = r }),
    )

    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña actual'), {
      target: { value: 'OldPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirma tu nueva contraseña'), {
      target: { value: 'NewPass12345!' },
    })

    const form = document.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Cambiando contraseña...')).toBeInTheDocument()
    })

    await act(async () => { resolveCall({}) })
  })
})
