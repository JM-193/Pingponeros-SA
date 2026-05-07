// Footer.test.jsx
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('renderiza footer con fondo oscuro', () => {
    const { container } = render(<Footer />)

    const footer = container.querySelector('footer')
    expect(footer).toHaveStyle('background-color: #2D2F34')
    expect(footer).toHaveStyle('color: #fff')
  })

  it('renderiza logo de UCR', () => {
    render(<Footer />)

    expect(screen.getByAltText('Universidad de Costa Rica')).toBeInTheDocument()
  })

  it('renderiza teléfono de contacto', () => {
    render(<Footer />)

    expect(screen.getByText('+506 2222-4040')).toBeInTheDocument()
  })

  it('renderiza email de contacto', () => {
    render(<Footer />)

    expect(screen.getByText('ecci@ucr.ac.cr')).toBeInTheDocument()
  })

  it('renderiza sección de contacto', () => {
    render(<Footer />)

    const headings = screen.getAllByText(/Contacto/i)
    expect(headings.length).toBeGreaterThan(0)
  })

  it('renderiza enlaces rápidos', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: /Portal UCR/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Matrícula Web/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Soporte Técnico/i })).toBeInTheDocument()
  })

  it('renderiza enlaces de redes sociales', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    // Instagram, Facebook, Portal UCR, MatrÃ­cula, Soporte
    expect(links.length).toBeGreaterThanOrEqual(5)
  })

  it('renderiza Instagram con atributo aria-label', () => {
    render(<Footer />)

    const instagramLink = screen.getByLabelText('Instagram').closest('a')
    expect(instagramLink).toBeInTheDocument()
    expect(instagramLink).toHaveAttribute('target', '_blank')
  })

  it('renderiza Facebook con atributo aria-label', () => {
    render(<Footer />)

    const facebookLink = screen.getByLabelText('Facebook').closest('a')
    expect(facebookLink).toBeInTheDocument()
    expect(facebookLink).toHaveAttribute('target', '_blank')
  })

  it('renderiza copyright', () => {
    render(<Footer />)

    expect(screen.getByText(/Escuela de Ciencias de la Computación/i)).toBeInTheDocument()
  })
})

