// FormInput.test.jsx
import { render, screen } from '@testing-library/react'
import FormInput from '../components/FormInput'

describe('FormInput', () => {
  it('muestra asterisco cuando required es true', () => {
    render(
      <FormInput
        label="Nombre"
        id="nombre"
        name="nombre"
        value=""
        onChange={() => {}}
        required
      />,
    )

    expect(screen.getByText('Nombre *')).toBeInTheDocument()
  })

  it('deshabilita el input cuando disabled es true', () => {
    render(
      <FormInput
        label="Correo"
        id="correo"
        name="correo"
        value=""
        onChange={() => {}}
        disabled
      />,
    )

    expect(screen.getByLabelText('Correo')).toBeDisabled()
  })
})

