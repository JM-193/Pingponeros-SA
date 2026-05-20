// CreateUnidad.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateUnidad from '../pages/CreateUnidad'
import * as areaService from '../services/areaService'
import * as departamentoService from '../services/departamentoService'
import * as seccionService from '../services/seccionService'

vi.mock('../services/unidadService')
vi.mock('../services/areaService')
vi.mock('../services/departamentoService')
vi.mock('../services/seccionService')

describe('CreateUnidad Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValueOnce([{ id: 1, nombre: 'Administración' }])
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce([{ id: 1, nombre: 'Compras' }])
    seccionService.obtenerSecciones.mockResolvedValueOnce([{ id: 1, nombre: 'Soporte' }])
  })

  it('renderiza formulario de crear unidad', async () => {
    render(
      <BrowserRouter>
        <CreateUnidad />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Unidad/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateUnidad />
      </BrowserRouter>,
    )

    expect(await screen.findByText('Página Principal')).toBeInTheDocument()
  })
})
