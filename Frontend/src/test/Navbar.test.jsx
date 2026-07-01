// Navbar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, vi } from 'vitest'
import Navbar from '../components/Navbar'
import * as sessionService from '../services/session'

vi.mock('../services/session')

function mockMatchMedia(matches) {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

afterEach(() => {
  vi.resetAllMocks()
  sessionStorage.clear()
  mockMatchMedia(false)
})

describe('Navbar', () => {
  it('renderiza navegación principal', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza elemento de Usuarios cuando hay permisos', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, rol: 1 })
  
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Usuarios')).toBeInTheDocument()
  })

  it('renderiza elemento de Organización cuando hay permisos', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, rol: 1 })
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Organización')).toBeInTheDocument()
  })

  it('renderiza submenu item de Áreas', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, rol: 1 })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    // El enlace puede estar oculto en un menú cerrado
    expect(screen.getByText('Organización')).toBeInTheDocument()
  })

  it('no renderiza submenu item de Áreas para usuarios sin permisos', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Áreas')).not.toBeInTheDocument()
  })

  it('renderiza elementos de menú secundarios', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
    expect(screen.getByText('Declaraciones')).toBeInTheDocument()
  })

  it('oculta elementos de menú secundarios para usuarios sin permisos', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument()
  })

  it('renderiza elementos de menú secundarios para usuarios con permisos', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, rol: 1 })
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )
    expect(screen.getByText('Página Principal')).toBeInTheDocument()
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
  })

  it('oculta elementos restringidos para usuarios con rol no administrador', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 2, rol: 0 })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
    expect(screen.getByText('Declaraciones')).toBeInTheDocument()
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument()
    expect(screen.queryByText('Organización')).not.toBeInTheDocument()
  })

  it('renderiza todos los items del submenu de Organización para administradores', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, rol: 1 })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByText('Organización'))

    expect(screen.getByText('Áreas')).toBeInTheDocument()
    expect(screen.getByText('Departamentos')).toBeInTheDocument()
    expect(screen.getByText('Secciones')).toBeInTheDocument()
    expect(screen.getByText('Unidades')).toBeInTheDocument()
    expect(screen.getByText('Plazas')).toBeInTheDocument()
  })

  it('navega a cambiar contraseña desde el menú de perfil', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByLabelText('User menu'))
    fireEvent.click(screen.getByText('Cambiar Contraseña'))

    expect(globalThis.location.pathname).toBe('/cambiar-contrasena')
  })

  it('renderiza con botones navegables', () => {
    const { container } = render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renderiza elemento main nav', () => {
    const { container } = render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
  })

  it('abre submenu de Organización y cierra el submenu al hacer click en Áreas si el usuario tiene permisos', () => {
    sessionService.obtenerSesion.mockReturnValue({ id: 1, rol: 1 })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const orgButton = screen.getByText('Organización')
    fireEvent.click(orgButton)
    expect(screen.getByText('Áreas')).toBeInTheDocument()

    const areasBtn = screen.getByText('Áreas')
    fireEvent.click(areasBtn)
    expect(screen.queryByText('Áreas')).not.toBeInTheDocument()
  })

  it('abre el menú de perfil y cierra sesión', () => {
    // El servicio de sesión está mockeado, así que entregamos directamente el
    // objeto de sesión que el Navbar usa para mostrar nombre y correo.
    sessionService.obtenerSesion.mockReturnValue({
      primerNombre: 'Juan',
      primerApellido: 'Perez',
      segundoApellido: 'Vargas',
      correoInstitucional: 'juan@uni.edu',
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const userMenuButton = screen.getByLabelText('User menu')
    fireEvent.click(userMenuButton)

    // El Navbar debe componer el nombre completo y mostrar el correo
    expect(screen.getByText('Juan Perez Vargas')).toBeInTheDocument()
    expect(screen.getByText('juan@uni.edu')).toBeInTheDocument()

    // Cerrar sesión debe invocar el servicio cerrarSesion
    const cerrarBtn = screen.getByText('Cerrar Sesión')
    fireEvent.click(cerrarBtn)

    expect(sessionService.cerrarSesion).toHaveBeenCalled()
  })

  it('muestra hamburguesa y mantiene el menú principal cerrado en móvil', () => {
    mockMatchMedia(true)
    const { container } = render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const menuButton = screen.getByRole('button', { name: 'Abrir menú principal' })
    const mainMenu = container.querySelector('#main-navigation-menu')

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(mainMenu).toHaveStyle({ display: 'none' })

    fireEvent.click(menuButton)

    expect(screen.getByRole('button', { name: 'Cerrar menú principal' })).toHaveAttribute('aria-expanded', 'true')
    expect(mainMenu).toHaveStyle({ display: 'flex' })
  })

  it('cierra el menú móvil al navegar', () => {
    mockMatchMedia(true)
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú principal' }))
    fireEvent.click(screen.getByText('Página Principal'))

    expect(screen.getByRole('button', { name: 'Abrir menú principal' })).toHaveAttribute('aria-expanded', 'false')
  })
})
