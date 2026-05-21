// ConsultarDepartamento.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarDepartamento from '../pages/ConsultarDepartamento'
import * as departamentoService from '../services/departamentoService'
import * as areaService from '../services/areaService'

vi.mock('../services/departamentoService')
vi.mock('../services/areaService')

describe('ConsultarDepartamento Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce([
      { id: 10, nombre: 'Compras', descripcion: 'Departamento de compras', idArea: 1, estado: 1 },
    ])
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('carga y renderiza departamentos', async () => {
    render(
      <BrowserRouter>
        <ConsultarDepartamento />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Compras')).toBeInTheDocument()
      expect(screen.getByText('Área de Administración')).toBeInTheDocument()
    })
  })

  it('llama a obtenerDepartamentos al montar', () => {
    render(
      <BrowserRouter>
        <ConsultarDepartamento />
      </BrowserRouter>,
    )

    expect(departamentoService.obtenerDepartamentos).toHaveBeenCalled()
  })
})
