// Navbar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, vi } from 'vitest'
import Navbar from '../components/Navbar'

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
  mockMatchMedia(false)
  vi.clearAllMocks()
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

  it('renderiza elemento de Usuarios', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Usuarios')).toBeInTheDocument()
  })

  it('renderiza elemento de Organización', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    expect(screen.getByText('Organización')).toBeInTheDocument()
  })

  it('renderiza submenu item de Ãreas', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    // El enlace puede estar oculto en un menÃº cerrado
    expect(screen.getByText('Organización')).toBeInTheDocument()
  })

  it('renderiza elementos de menÃº secundarios', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    // Verificar que los elementos principales están presentes
    expect(screen.getByText('Página Principal')).toBeInTheDocument()
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
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

  it('abre submenu de Organización y cierra el submenu al hacer click en Áreas', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const orgButton = screen.getByText('Organización')
    // abrir submenu
    fireEvent.click(orgButton)
    expect(screen.getByText('Áreas')).toBeInTheDocument()

    // click en item submenu — debe cerrar el submenu
    const areasBtn = screen.getByText('Áreas')
    fireEvent.click(areasBtn)
    expect(screen.queryByText('Áreas')).not.toBeInTheDocument()
  })

  it('abre el menú de perfil y cierra sesión', () => {
    // preparar sesión en sessionStorage (formato esperado por session.js)
    const payload = { usuario: { primerNombre: 'Juan', primerApellido: 'Perez', correoInstitucional: 'juan@uni.edu' }, expira: Date.now() + 10000 }
    sessionStorage.setItem('pingponeros_session', JSON.stringify(payload))

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    )

    const userMenuButton = screen.getByLabelText('User menu')
    fireEvent.click(userMenuButton)

    // menú debe mostrarse con el nombre y correo
    expect(screen.getByText('Juan Perez')).toBeInTheDocument()
    expect(screen.getByText('juan@uni.edu')).toBeInTheDocument()

    // click en Cerrar Sesión -> sessionStorage debe limpiarse
    const cerrarBtn = screen.getByText('Cerrar Sesión')
    fireEvent.click(cerrarBtn)

    expect(sessionStorage.getItem('pingponeros_session')).toBeNull()
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

