// CreateDepartamento.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateDepartamento from '../pages/CreateDepartamento'
import * as areaService from '../services/areaService'

vi.mock('../services/departmentService')
vi.mock('../services/areaService')

describe('CreateDepartamento Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue([
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

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })
})
