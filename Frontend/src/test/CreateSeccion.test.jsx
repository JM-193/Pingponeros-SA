// CreateSeccion.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateSeccion from '../pages/CreateSeccion'
import * as areaService from '../services/areaService'

vi.mock('../services/seccionService')
vi.mock('../services/areaService')

describe('CreateSeccion Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza formulario de crear sección', async () => {
    render(
      <BrowserRouter>
        <CreateSeccion />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Sección/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la sección')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateSeccion />
      </BrowserRouter>,
    )

    expect(await screen.findByText('Página Principal')).toBeInTheDocument()
  })
})
