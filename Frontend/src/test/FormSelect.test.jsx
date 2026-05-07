// FormSelect.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import FormSelect from '../components/FormSelect'

describe('FormSelect', () => {
  const mockOptions = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ]

  it('renderiza el label correctamente', () => {
    render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={() => {}}
        options={mockOptions}
      />,
    )

    expect(screen.getByText('Seleccione')).toBeInTheDocument()
  })

  it('muestra asterisco cuando required es true', () => {
    render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={() => {}}
        options={mockOptions}
        required
      />,
    )

    expect(screen.getByText('Seleccione *')).toBeInTheDocument()
  })

  it('renderiza todas las opciones', () => {
    render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={() => {}}
        options={mockOptions}
        defaultLabel="Seleccione una opción"
      />,
    )

    expect(screen.getByDisplayValue('Seleccione una opción')).toBeInTheDocument()
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('llama a onChange cuando se selecciona una opción', () => {
    const onChange = vi.fn()
    render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={onChange}
        options={mockOptions}
      />,
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '2' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('muestra el defaultLabel personalizado', () => {
    render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={() => {}}
        options={mockOptions}
        defaultLabel="Elige una opción"
      />,
    )

    expect(screen.getByDisplayValue('Elige una opción')).toBeInTheDocument()
  })

  it('selecciona el valor correcto', () => {
    const { rerender } = render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={() => {}}
        options={mockOptions}
      />,
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('')

    rerender(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value="2"
        onChange={() => {}}
        options={mockOptions}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('2')
  })

  it('renderiza select con required attribute cuando es requerido', () => {
    render(
      <FormSelect
        label="Seleccione"
        id="select1"
        name="select1"
        value=""
        onChange={() => {}}
        options={mockOptions}
        required
        defaultLabel="Seleccione una opción"
      />,
    )

    expect(screen.getByRole('combobox')).toBeRequired()
  })
})

