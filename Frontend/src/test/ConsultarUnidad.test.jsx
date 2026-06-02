// ConsultarUnidad.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarUnidad from '../pages/ConsultarUnidad'
import * as unidadService from '../services/unidadService'
import * as areaService from '../services/areaService'
import * as departamentoService from '../services/departamentoService'
import * as seccionService from '../services/seccionService'

vi.mock('../services/unidadService', () => ({
  obtenerUnidades: vi.fn(),
}))
vi.mock('../services/areaService', () => ({
  obtenerAreas: vi.fn(),
}))
vi.mock('../services/departamentoService', () => ({
  obtenerDepartamentos: vi.fn(),
}))
vi.mock('../services/seccionService', () => ({
  obtenerSecciones: vi.fn(),
}))

describe('ConsultarUnidad Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unidadService.obtenerUnidades.mockResolvedValue([
      {
        id: 30,
        nombre: 'Unidad Técnica',
        descripcion: 'Unidad de soporte',
        idArea: 1,
        idDepartamento: 2,
        estado: 1,
      },
    ])
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
    departamentoService.obtenerDepartamentos.mockResolvedValue([
      { id: 2, nombre: 'Compras', descripcion: 'Departamento' },
    ])
    seccionService.obtenerSecciones.mockResolvedValue([])
  })

  it('carga y renderiza unidades', async () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    // Wait for the unit name to appear
    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('llama a obtenerUnidades al montar', () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    expect(unidadService.obtenerUnidades).toHaveBeenCalled()
  })
})
