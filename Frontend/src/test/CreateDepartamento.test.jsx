// CreateDepartamento.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateDepartamento from '../pages/CreateDepartamento'
import * as areaService from '../services/areaService'

vi.mock('../services/departamentoService')
vi.mock('../services/areaService')

describe('CreateDepartamento Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza formulario de crear departamento', async () => {
    render(
      <BrowserRouter>
        <CreateDepartamento />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Departamento/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateDepartamento />
      </BrowserRouter>,
    )

    expect(await screen.findByText('Página Principal')).toBeInTheDocument()
  })
})
