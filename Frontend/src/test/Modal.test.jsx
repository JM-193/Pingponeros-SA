// Modal.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../components/Modal'

describe('Modal', () => {
  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Contenido</p>
      </Modal>,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renderiza cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} title="Título del modal" onClose={() => {}}>
        <p>Contenido del modal</p>
      </Modal>,
    )

    expect(screen.getByText('Título del modal')).toBeInTheDocument()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
  })

  it('renderiza como elemento dialog con atributos de accesibilidad', () => {
    render(
      <Modal isOpen={true} title="Test" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('open')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('muestra el título con id correcto para aria-labelledby', () => {
    render(
      <Modal isOpen={true} title="Mi Título" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )

    const heading = screen.getByRole('heading', { name: 'Mi Título' })
    expect(heading).toHaveAttribute('id', 'modal-title')
  })

  it('llama a onClose cuando se hace clic en el botón de cerrar', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} title="Test" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    )

    const closeButton = screen.getByRole('button', { name: 'Cerrar modal' })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('bloquea el scroll del body cuando está abierto', () => {
    document.body.style.overflow = ''

    const { unmount } = render(
      <Modal isOpen={true} title="Test" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('restaura el overflow previo del body al cerrar', () => {
    document.body.style.overflow = 'auto'

    const { unmount } = render(
      <Modal isOpen={true} title="Test" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('renderiza children correctamente', () => {
    render(
      <Modal isOpen={true} title="Test" onClose={() => {}}>
        <div data-testid="child-content">
          <span>Primer hijo</span>
          <span>Segundo hijo</span>
        </div>
      </Modal>,
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Primer hijo')).toBeInTheDocument()
    expect(screen.getByText('Segundo hijo')).toBeInTheDocument()
  })

  it('aplica maxWidth personalizado', () => {
    render(
      <Modal isOpen={true} title="Test" onClose={() => {}} maxWidth="500px">
        <p>Body</p>
      </Modal>,
    )

    const contentBox = document.querySelector('dialog > div:nth-child(2)')
    expect(contentBox.style.maxWidth).toBe('500px')
  })

  it('usa maxWidth por defecto de 700px', () => {
    render(
      <Modal isOpen={true} title="Test" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )

    const contentBox = document.querySelector('dialog > div:nth-child(2)')
    expect(contentBox.style.maxWidth).toBe('700px')
  })

  it('no bloquea scroll cuando isOpen es false', () => {
    document.body.style.overflow = 'auto'

    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )

    expect(document.body.style.overflow).toBe('auto')
  })
})
