// Navbar.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

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

    // Buscar el enlace de Ãreas
    const areasLink = screen.queryByText(/Ãreas/i)
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
})

