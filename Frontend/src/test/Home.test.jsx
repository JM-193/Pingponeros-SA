// Home.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'

describe('Home Page', () => {
  it('renderiza página principal con títulos', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText('Vicerrectoría de Administración')).toBeInTheDocument()
    expect(screen.getByText('La Aplicación de Cargas de Trabajo')).toBeInTheDocument()
  })

  it('renderiza descripción de la aplicación', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/La herramienta para la aplicación de cargas de trabajo/i)).toBeInTheDocument()
  })

  it('renderiza sección de declaraciones', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Declaraciones Jurada del Puesto de Trabajo/i)).toBeInTheDocument()
  })

  it('renderiza Header', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('renderiza Navbar', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('tiene layout flexible de full height', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveStyle('min-height: 100vh')
    expect(mainDiv).toHaveStyle('display: flex')
    expect(mainDiv).toHaveStyle('flex-direction: column')
  })

  it('contiene elemento main', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveStyle('flex: 1')
  })
})

