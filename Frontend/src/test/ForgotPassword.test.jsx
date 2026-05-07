// ForgotPassword.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ForgotPassword from '../pages/ForgotPassword'

describe('ForgotPassword Page', () => {
  it('renderiza página de recuperación de contraseña', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Recuperar Contraseña|Olvidé mi contraseña|Reset/i)).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>,
    )

    // Verificar que hay Header (con logos)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('tiene estructura de página de autenticación', () => {
    const { container } = render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>,
    )

    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
  })
})

