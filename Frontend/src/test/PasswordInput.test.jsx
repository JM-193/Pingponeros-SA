// PasswordInput.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import PasswordInput from '../components/PasswordInput'

const defaultProps = {
  label: 'Contraseña',
  id: 'password',
  name: 'password',
  value: '',
  onChange: vi.fn(),
}

describe('PasswordInput', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza el label y el input', () => {
    render(<PasswordInput {...defaultProps} />)

    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
  })

  it('muestra asterisco cuando required es true', () => {
    render(<PasswordInput {...defaultProps} required />)

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('no muestra asterisco cuando required es false', () => {
    render(<PasswordInput {...defaultProps} />)

    expect(screen.getByText('Contraseña')).toBeInTheDocument()
    expect(screen.queryByText('Contraseña *')).not.toBeInTheDocument()
  })

  it('alterna entre tipo password y text al hacer clic en el botón', () => {
    render(<PasswordInput {...defaultProps} />)

    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('muestra mensaje de error cuando se pasa error', () => {
    render(<PasswordInput {...defaultProps} error="La contraseña es requerida" />)

    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
  })

  it('no muestra mensaje de error cuando no hay error', () => {
    render(<PasswordInput {...defaultProps} />)

    expect(screen.queryByText(/requerida/i)).not.toBeInTheDocument()
  })

  it('aplica borde rojo cuando hay error', () => {
    render(<PasswordInput {...defaultProps} error="Error" />)

    const input = screen.getByLabelText('Contraseña')
    expect(input.style.border).toContain('2px solid')
  })

  it('renderiza placeholder correctamente', () => {
    render(<PasswordInput {...defaultProps} placeholder="Ingresa tu contraseña" />)

    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument()
  })

  it('llama a onChange cuando el usuario escribe', () => {
    const handleChange = vi.fn()
    render(<PasswordInput {...defaultProps} onChange={handleChange} value="abc" />)

    const input = screen.getByLabelText('Contraseña')
    fireEvent.change(input, { target: { value: 'abc123' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('deshabilita el input cuando disabled es true', () => {
    render(<PasswordInput {...defaultProps} disabled />)

    expect(screen.getByLabelText('Contraseña')).toBeDisabled()
  })
})
