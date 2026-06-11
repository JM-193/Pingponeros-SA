// EditDepartments.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditDepartments from '../pages/EditDepartments'

describe('EditDepartments Page', () => {
  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditDepartments />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })
})
