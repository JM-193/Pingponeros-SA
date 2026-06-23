// ProtectedRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
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

    render(
      <MemoryRouter initialEntries={['/home']}>
        <ProtectedRoute>
          <div>Homepage</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    // Navigate should redirect to "/"
    expect(screen.queryByText('Homepage')).not.toBeInTheDocument()
  })

  it('renderiza múltiples hijos cuando hay sesión', () => {
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
    const llamadasTrasPrimerRender = sessionService.obtenerSesion.mock.calls.length

    sessionService.obtenerSesion.mockReturnValue(null)

    rerender(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Contenido</div>
        </ProtectedRoute>
      </BrowserRouter>,
    )

    // Se vuelve a consultar la sesión en cada render (sin memoización del valor).
    expect(sessionService.obtenerSesion.mock.calls.length).toBeGreaterThan(llamadasTrasPrimerRender)
  })

  it('redirige a /cambiar-contrasena si la contraseña es temporal', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User' })
    sessionService.esContrasenaTemporal.mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route path="/home" element={ <ProtectedRoute> Homepage </ProtectedRoute> } />
          <Route path="/cambiar-contrasena" element={<div>Cambiar contraseña</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Homepage')).not.toBeInTheDocument()
    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument()
  })

  it('permite acceder a /cambiar-contrasena si la contraseña es temporal', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User' })
    sessionService.esContrasenaTemporal.mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/cambiar-contrasena']}>
        <Routes>
          <Route path="/cambiar-contrasena" element={ <ProtectedRoute> Cambiar contraseña </ProtectedRoute> } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument()
  })

  it('redirige a /home si el rol no está permitido', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User', rol: 0 })
    sessionService.esContrasenaTemporal.mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={ <ProtectedRoute allowedRoles={[1]}> Admin </ProtectedRoute> } />
          <Route path="/home" element={<div>Homepage</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    expect(screen.getByText('Homepage')).toBeInTheDocument()
  })

  it('permite acceder si el rol está permitido', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User', rol: 2 })
    sessionService.esContrasenaTemporal.mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={ <ProtectedRoute allowedRoles={[1, 2]}> Admin </ProtectedRoute> } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renderiza Outlet si no hay children y hay sesión', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, nombre: 'User' })
    sessionService.esContrasenaTemporal.mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route path="/home" element={ <ProtectedRoute /> }>
            <Route index element={<div>Homepage</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Homepage')).toBeInTheDocument()
  })
})
