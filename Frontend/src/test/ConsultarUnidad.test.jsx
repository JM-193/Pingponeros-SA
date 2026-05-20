// ConsultarUnidad.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarUnidad from '../pages/ConsultarUnidad'
import * as unidadService from '../services/unidadService'
import * as areaService from '../services/areaService'
import * as departamentoService from '../services/departamentoService'
import * as seccionService from '../services/seccionService'

vi.mock('../services/unidadService')
vi.mock('../services/areaService')
vi.mock('../services/departamentoService')
vi.mock('../services/seccionService')

describe('ConsultarUnidad Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unidadService.obtenerUnidades.mockResolvedValueOnce([
      {
        id: 30,
        nombre: 'Unidad Técnica',
        descripcion: 'Unidad de soporte',
        idArea: 1,
        idDepartamento: 2,
        estado: 1,
      },
    ])
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce([
      { id: 2, nombre: 'Compras', descripcion: 'Departamento' },
    ])
    seccionService.obtenerSecciones.mockResolvedValueOnce([])
  })

  it('carga y renderiza unidades', async () => {
    render(
      <BrowserRouter>
        <ConsultarUnidad />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unidad Técnica')).toBeInTheDocument()
      expect(screen.getByText('Área de Administración')).toBeInTheDocument()
      expect(screen.getByText('Departamento de Compras')).toBeInTheDocument()
    })
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
