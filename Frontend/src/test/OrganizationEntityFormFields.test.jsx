// OrganizationEntityFormFields.test.jsx
import { render, screen } from '@testing-library/react'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'

describe('OrganizationEntityFormFields', () => {
  const baseFormData = {
    idArea: '',
    idDepartamento: '',
    idSeccion: '',
    nombre: '',
    descripcion: '',
  }

  const baseProps = {
    formData: baseFormData,
    onChange: () => {},
    namePrefix: 'Área de',
    namePlaceholder: 'Nombre del área',
    descriptionPlaceholder: 'Ingrese la descripción del área',
  }

  it('renderiza campo de nombre y descripción', () => {
    render(<OrganizationEntityFormFields {...baseProps} />)

    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese la descripción del área')).toBeInTheDocument()
  })

  it('muestra el prefijo del nombre', () => {
    render(<OrganizationEntityFormFields {...baseProps} />)

    expect(screen.getByText('Área de')).toBeInTheDocument()
  })

  it('renderiza select de área cuando hay opciones', () => {
    render(
      <OrganizationEntityFormFields
        {...baseProps}
        areaOptions={[{ value: '1', label: 'Área de Administración' }]}
        areaRequired
      />,
    )

    expect(screen.getByRole('combobox', { name: /^Área/ })).toBeInTheDocument()
  })

  it('renderiza select de departamento cuando aplica', () => {
    render(
      <OrganizationEntityFormFields
        {...baseProps}
        parentType="departamento"
        parentTypeOptions={[
          { value: 'departamento', label: 'Departamento' },
          { value: 'seccion', label: 'Sección' },
        ]}
        onParentTypeChange={() => {}}
        departmentOptions={[{ value: '1', label: 'Departamento de Sistemas' }]}
        parentRequired
      />,
    )

    expect(screen.getByRole('combobox', { name: /^Departamento/ })).toBeInTheDocument()
  })
})
