// ProtectedRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import * as sessionService from '../services/session'

vi.mock('../services/session')

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza children cuando hay sesión válida', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'Test' })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('no renderiza children cuando no hay sesión', () => {
    sessionService.obtenerSesion.mockReturnValue(null)

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('redirige a / cuando no hay sesión', () => {
    sessionService.obtenerSesion.mockReturnValue(null)

    const { container } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    // Navigate should redirect to "/"
    expect(container.innerHTML).not.toContain('Contenido protegido')
  })

  it('renderiza mÃºltiples hijos cuando hay sesión', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User' })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Página 1</div>
          <div>Página 2</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    expect(screen.getByText('Página 1')).toBeInTheDocument()
    expect(screen.getByText('Página 2')).toBeInTheDocument()
  })

  it('verifica sesión en cada render', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1 })

    const { rerender } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Contenido</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    expect(sessionService.obtenerSesion).toHaveBeenCalled()

    sessionService.obtenerSesion.mockReturnValue(null)

    rerender(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Contenido</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    expect(sessionService.obtenerSesion).toHaveBeenCalledTimes(2)
  })
})

