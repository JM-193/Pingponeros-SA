// EditDepartamento.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditDepartamento from '../pages/EditDepartamento'

describe('EditDepartamento Page', () => {
  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditDepartamento />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })
})
