// AuthLayout.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

describe('AuthLayout', () => {
  it('renderiza children correctamente', () => {
    render(
      <BrowserRouter>
        <AuthLayout>
          <div>Test Content</div>
        </AuthLayout>
      </BrowserRouter>,
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renderiza Header', () => {
    render(
      <BrowserRouter>
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      </BrowserRouter>,
    )

    // Header contiene las imágenes de UCR y VRA
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('estructura el layout correctamente con main centrado', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      </BrowserRouter>,
    )

    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveStyle('display: flex')
    expect(main).toHaveStyle('align-items: center')
    expect(main).toHaveStyle('justify-content: center')
  })

  it('renderiza con minHeight 100vh', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      </BrowserRouter>,
    )

    const page = container.firstChild
    expect(page).toHaveStyle('min-height: 100vh')
  })

  it('renderiza múltiples hijos complejos', () => {
    render(
      <BrowserRouter>
        <AuthLayout>
          <div>
            <form>
              <input placeholder="Email" />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </AuthLayout>
      </BrowserRouter>,
    )

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

