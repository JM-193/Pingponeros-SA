// Header.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../components/Header'

describe('Header', () => {
  it('renderiza el header con fondo azul', () => {
    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveStyle('background-color: #57bde8')
  })

  it('renderiza imágenes de logos', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(2)
  })

  it('renderiza logo de UCR', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    expect(screen.getByAltText('Universidad de Costa Rica')).toBeInTheDocument()
  })

  it('renderiza logo de VRA', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    expect(screen.getByAltText('Vicerrectoría de Administración')).toBeInTheDocument()
  })

  it('tiene links a home', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(2)
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/home')
    })
  })

  it('aplica estilos flexibles de layout', () => {
    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    const header = container.querySelector('header')
    expect(header).toHaveStyle('display: flex')
    expect(header).toHaveStyle('align-items: center')
    expect(header).toHaveStyle('justify-content: flex-start')
  })
})

