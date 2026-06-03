// EditSeccion.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditSeccion from '../pages/EditSeccion'

describe('EditSeccion Page', () => {
  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditSeccion />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando sección...')).toBeInTheDocument()
  })
})
