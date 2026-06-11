// EditSections.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditSections from '../pages/EditSections'

describe('EditSections Page', () => {
  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditSections />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando sección...')).toBeInTheDocument()
  })
})
