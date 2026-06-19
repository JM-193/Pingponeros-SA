// OrganizationEntityFormModal.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'

describe('OrganizationEntityFormModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Crear Entidad',
    onSubmit: vi.fn((e) => e.preventDefault()),
    onClose: vi.fn(),
    primaryLabel: 'Crear',
  }

  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <OrganizationEntityFormModal {...defaultProps} isOpen={false}>
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('renderiza el modal con título y children', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps}>
        <p>Campos del formulario</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByText('Crear Entidad')).toBeInTheDocument()
    expect(screen.getByText('Campos del formulario')).toBeInTheDocument()
  })

  it('no renderiza subtítulo en el modal', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps} subtitle="Formulario de Registro">
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.queryByText('Formulario de Registro')).not.toBeInTheDocument()
  })

  it('renderiza botones de Cancelar y el primary label', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps}>
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <OrganizationEntityFormModal {...defaultProps} onClose={onClose}>
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('llama a onClose al hacer clic en el botón X del modal', () => {
    const onClose = vi.fn()
    render(
      <OrganizationEntityFormModal {...defaultProps} onClose={onClose}>
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra mensaje de éxito', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps} successMsg="Entidad creada correctamente">
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByText('Entidad creada correctamente')).toBeInTheDocument()
  })

  it('muestra mensaje de error', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps} errorMsg="Error al crear entidad">
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByText('Error al crear entidad')).toBeInTheDocument()
  })

  it('deshabilita botones cuando isBusy es true', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps} isBusy={true} primaryLoadingLabel="Guardando...">
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled()
  })

  it('muestra primaryLoadingLabel por defecto cuando isBusy', () => {
    render(
      <OrganizationEntityFormModal {...defaultProps} isBusy={true}>
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeInTheDocument()
  })

  it('renderiza extraActions cuando se proporcionan', () => {
    render(
      <OrganizationEntityFormModal
        {...defaultProps}
        extraActions={<button type="button">Acción Extra</button>}
      >
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    expect(screen.getByRole('button', { name: 'Acción Extra' })).toBeInTheDocument()
  })

  it('llama a onSubmit cuando se envía el formulario', () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(
      <OrganizationEntityFormModal {...defaultProps} onSubmit={onSubmit}>
        <p>Campos</p>
      </OrganizationEntityFormModal>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))
    expect(onSubmit).toHaveBeenCalled()
  })
})
