// FormRow.test.jsx
import { render, screen } from '@testing-library/react'
import FormRow from '../components/FormRow'

describe('FormRow', () => {
  it('renderiza hijos correctamente', () => {
    render(
      <FormRow columns={2}>
        <div>Campo 1</div>
        <div>Campo 2</div>
      </FormRow>,
    )

    expect(screen.getByText('Campo 1')).toBeInTheDocument()
    expect(screen.getByText('Campo 2')).toBeInTheDocument()
  })

  it('usa 1 columna por defecto', () => {
    const { container } = render(
      <FormRow>
        <div>Campo</div>
      </FormRow>,
    )

    const div = container.firstChild
    expect(div).toHaveStyle('grid-template-columns: repeat(1, 1fr)')
  })

  it('aplica el nÃºmero correcto de columnas', () => {
    const { container } = render(
      <FormRow columns={3}>
        <div>C1</div>
        <div>C2</div>
        <div>C3</div>
      </FormRow>,
    )

    const div = container.firstChild
    expect(div).toHaveStyle('grid-template-columns: repeat(3, 1fr)')
  })

  it('aplica gap de 20px', () => {
    const { container } = render(
      <FormRow columns={2}>
        <div>C1</div>
        <div>C2</div>
      </FormRow>,
    )

    const div = container.firstChild
    expect(div).toHaveStyle('gap: 20px')
  })

  it('aplica marginBottom de 20px', () => {
    const { container } = render(
      <FormRow columns={2}>
        <div>C1</div>
      </FormRow>,
    )

    const div = container.firstChild
    expect(div).toHaveStyle('margin-bottom: 20px')
  })

  it('maneja mÃºltiples hijos complejos', () => {
    render(
      <FormRow columns={4}>
        <input type="text" placeholder="Nombre" />
        <input type="email" placeholder="Email" />
        <input type="tel" placeholder="Teléfono" />
        <button>Enviar</button>
      </FormRow>,
    )

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

