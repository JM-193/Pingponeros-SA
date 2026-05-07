// OrganizationUnitFormFields.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import OrganizationUnitFormFields from '../components/OrganizationUnitFormFields'

describe('OrganizationUnitFormFields', () => {
  const mockFormData = {
    nombre: '',
    descripcion: '',
  }

  it('renderiza campo de nombre', () => {
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={() => {}}
      />,
    )

    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
  })

  it('renderiza campo de descripción', () => {
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={() => {}}
      />,
    )

    expect(screen.getByPlaceholderText('Ingrese la descripción del área')).toBeInTheDocument()
  })

  it('muestra el label "Ãrea de"', () => {
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={() => {}}
      />,
    )

    expect(screen.getByText('Ãrea de')).toBeInTheDocument()
  })

  it('muestra "Descripción *" indicando que es requerido', () => {
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={() => {}}
      />,
    )

    expect(screen.getByText('Descripción *')).toBeInTheDocument()
  })

  it('actualiza valor de nombre correctamente', () => {
    const onChange = vi.fn()
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={onChange}
      />,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Administración' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('actualiza valor de descripción correctamente', () => {
    const onChange = vi.fn()
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={onChange}
      />,
    )

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Ãrea de administración general' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('muestra los valores actuales del formulario', () => {
    const formData = {
      nombre: 'Contabilidad',
      descripcion: 'Ãrea de contabilidad',
    }

    render(
      <OrganizationUnitFormFields
        formData={formData}
        onChange={() => {}}
      />,
    )

    expect(screen.getByDisplayValue('Contabilidad')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Ãrea de contabilidad')).toBeInTheDocument()
  })

  it('renderiza inputs como requeridos', () => {
    render(
      <OrganizationUnitFormFields
        formData={mockFormData}
        onChange={() => {}}
      />,
    )

    expect(screen.getByPlaceholderText('Nombre del área')).toBeRequired()
    expect(screen.getByPlaceholderText('Ingrese la descripción del área')).toBeRequired()
  })
})

