// EditUnidad.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditUnidad from '../pages/EditUnidad'

describe('EditUnidad Page', () => {
  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditUnidad />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando unidad...')).toBeInTheDocument()
  })
})
