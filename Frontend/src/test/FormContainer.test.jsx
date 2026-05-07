// FormContainer.test.jsx
import { render, screen } from '@testing-library/react'
import FormContainer from '../components/FormContainer'

describe('FormContainer', () => {
  it('renderiza el formulario con children', () => {
    render(
      <FormContainer onSubmit={() => {}}>
        <input placeholder="Test input" />
      </FormContainer>,
    )

    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
  })

  it('renderiza title cuando se proporciona', () => {
    render(
      <FormContainer onSubmit={() => {}} title="Mi Formulario">
        <div>Contenido</div>
      </FormContainer>,
    )

    expect(screen.getByText('Mi Formulario')).toBeInTheDocument()
  })

  it('renderiza subtitle cuando se proporciona', () => {
    render(
      <FormContainer onSubmit={() => {}} subtitle="SubtÃ­tulo">
        <div>Contenido</div>
      </FormContainer>,
    )

    expect(screen.getByText('SubtÃ­tulo')).toBeInTheDocument()
  })

  it('renderiza title y subtitle juntos', () => {
    render(
      <FormContainer onSubmit={() => {}} title="TÃ­tulo" subtitle="SubtÃ­tulo">
        <div>Contenido</div>
      </FormContainer>,
    )

    expect(screen.getByText('TÃ­tulo')).toBeInTheDocument()
    expect(screen.getByText('SubtÃ­tulo')).toBeInTheDocument()
  })

  it('no renderiza title si no se proporciona', () => {
    const { container } = render(
      <FormContainer onSubmit={() => {}}>
        <div>Contenido</div>
      </FormContainer>,
    )

    const h1 = container.querySelector('h1')
    expect(h1).not.toBeInTheDocument()
  })

  it('no renderiza subtitle si no se proporciona', () => {
    const { container } = render(
      <FormContainer onSubmit={() => {}}>
        <div>Contenido</div>
      </FormContainer>,
    )

    const h2 = container.querySelector('h2')
    expect(h2).not.toBeInTheDocument()
  })

  it('llama a onSubmit cuando se envÃ­a el formulario', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    render(
      <FormContainer onSubmit={handleSubmit}>
        <button type="submit">Enviar</button>
      </FormContainer>,
    )

    const button = screen.getByRole('button')
    button.click()

    expect(handleSubmit).toHaveBeenCalled()
  })

  it('renderiza form element', () => {
    const { container } = render(
      <FormContainer onSubmit={() => {}}>
        <div>Contenido</div>
      </FormContainer>,
    )

    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('aplica estilos correctos al formulario', () => {
    const { container } = render(
      <FormContainer onSubmit={() => {}}>
        <div>Contenido</div>
      </FormContainer>,
    )

    const form = container.querySelector('form')
    expect(form).toHaveStyle('max-width: 700px')
    expect(form).toHaveStyle('margin: 0 auto')
    expect(form).toHaveStyle('padding: 32px')
  })
})

