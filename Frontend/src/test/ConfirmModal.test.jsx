// ConfirmModal.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../components/ConfirmModal'

describe('ConfirmModal', () => {
  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        title="Confirmar"
        message="¿Estás seguro?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renderiza cuando isOpen es true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Estás seguro?"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
  })

  it('renderiza botones con labels personalizados', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Continuar?"
        confirmLabel="Aceptar"
        cancelLabel="Rechazar"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument()
  })

  it('llama a onConfirm cuando se hace clic en confirmar', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Estás seguro?"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sí' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('llama a onCancel cuando se hace clic en cancelar', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Estás seguro?"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('renderiza con dos botones de acción (más backdrop)', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Continuar?"
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    // Tenemos 3: backdrop button + confirm + cancel
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})

