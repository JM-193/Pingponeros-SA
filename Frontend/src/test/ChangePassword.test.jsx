// ChangePassword.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import ChangePassword from '../pages/ChangePassword'
import * as authService from '../services/authService'
import * as sessionService from '../services/session'
import * as alertUtils from '../utils/alerts'

vi.mock('../utils/alerts', () => ({
  blockingInfo: vi.fn(),
}))

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

    expect(screen.getByText(/no cumple los requisitos de complejidad/i)).toBeInTheDocument()
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
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Contraseña actualizada correctamente'),
        expect.anything()
      )
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
      expect(toast.error).toHaveBeenCalledWith('Contraseña incorrecta', expect.anything())
    })
  })

  describe('checklist de requisitos de contraseña', () => {
    it('no muestra el checklist cuando el campo está vacío', () => {
      renderPage()

      expect(screen.queryByText('Mínimo 12 caracteres')).not.toBeInTheDocument()
    })

    it('muestra el checklist cuando se escribe en el campo de nueva contraseña', () => {
      renderPage()

      fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
        target: { value: 'a' },
      })

      expect(screen.getByText('Mínimo 12 caracteres')).toBeInTheDocument()
      expect(screen.getByText('Una mayúscula')).toBeInTheDocument()
      expect(screen.getByText('Una minúscula')).toBeInTheDocument()
      expect(screen.getByText('Un número')).toBeInTheDocument()
      expect(screen.getByText('Un carácter especial (!@#$%&*)')).toBeInTheDocument()
    })

    it('marca todos los requisitos como válidos con una contraseña fuerte', () => {
      renderPage()

      fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
        target: { value: 'StrongPass1!' },
      })

      // Los 5 elementos del checklist renderizados
      expect(screen.getByText('Mínimo 12 caracteres')).toBeInTheDocument()
      expect(screen.getByText('Una mayúscula')).toBeInTheDocument()
      expect(screen.getByText('Una minúscula')).toBeInTheDocument()
      expect(screen.getByText('Un número')).toBeInTheDocument()
      expect(screen.getByText('Un carácter especial (!@#$%&*)')).toBeInTheDocument()

      // Los elementos li con clase valid (react-password-checklist marca los elementos válidos)
      const validItems = document.querySelectorAll('li.valid')
      expect(validItems.length).toBeGreaterThan(0)
    })

    it('cumple el requisito de longitud al llegar a 12 caracteres', () => {
      renderPage()

      fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
        target: { value: 'ShortPass1!' },
      })
      expect(document.querySelectorAll('li.invalid').length).toBeGreaterThan(0)

      fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
        target: { value: 'LongEnoughP1!' },
      })

      const lengthItem = screen.getByText('Mínimo 12 caracteres').closest('li')
      expect(lengthItem).toHaveClass('valid')
    })

    it('oculta el checklist cuando el campo se vacía', () => {
      renderPage()

      fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
        target: { value: 'Something1!' },
      })
      expect(screen.getByText('Mínimo 12 caracteres')).toBeInTheDocument()

      fireEvent.change(screen.getByPlaceholderText('Ingresa tu nueva contraseña'), {
        target: { value: '' },
      })
      expect(screen.queryByText('Mínimo 12 caracteres')).not.toBeInTheDocument()
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

  it('Muestra alerta bloqueante cuando el cambio de contraseña es forzado', async () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User' })
    sessionService.esContrasenaTemporal.mockReturnValue(true)

    renderPage()

    await waitFor(() =>{
      expect(alertUtils.blockingInfo).toHaveBeenCalledWith(
        'Contraseña temporal',
        'Tu contraseña es temporal. Debes establecer una nueva para continuar.'
      )
    })

  })

  it('Mantiene sesión activa y redirige al Home tras cambiar la contraseña temporal', async () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User' })
    sessionService.esContrasenaTemporal.mockReturnValue(true)

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
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Contraseña actualizada correctamente'),
        expect.anything()
      )
      // El flag temporal se limpia pero la sesión permanece activa.
      expect(sessionService.limpiarContrasenaTemporal).toHaveBeenCalled()
      expect(sessionService.cerrarSesion).not.toHaveBeenCalled()
    })
  })
})
