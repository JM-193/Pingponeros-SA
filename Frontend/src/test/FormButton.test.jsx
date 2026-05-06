// FormButton.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import FormButton from '../components/FormButton'

describe('FormButton', () => {
  it('renderiza el texto del botón', () => {
    render(<FormButton label="Guardar" />)

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('aplica el tipo submit por defecto', () => {
    render(<FormButton label="Enviar" />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('aplica el tipo personalizado cuando se indica', () => {
    render(<FormButton label="Cancelar" type="button" />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('renderiza deshabilitado cuando disabled es true', () => {
    render(<FormButton label="Guardar" disabled />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('llama a onClick al hacer clic', () => {
    const onClick = vi.fn()
    render(<FormButton label="Guardar" onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('no llama a onClick cuando está deshabilitado', () => {
    const onClick = vi.fn()
    render(<FormButton label="Guardar" onClick={onClick} disabled />)

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('usa variante secundaria cuando variant es secondary', () => {
    render(<FormButton label="Volver" variant="secondary" />)

    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
  })
})
