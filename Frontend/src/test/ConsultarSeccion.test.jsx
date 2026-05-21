// ConsultarSeccion.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ConsultarSeccion from '../pages/ConsultarSeccion'
import * as seccionService from '../services/seccionService'
import * as areaService from '../services/areaService'

vi.mock('../services/seccionService')
vi.mock('../services/areaService')

describe('ConsultarSeccion Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    seccionService.obtenerSecciones.mockResolvedValueOnce([
      { id: 20, nombre: 'Soporte', descripcion: 'Sección de soporte', idArea: 1, estado: 1 },
    ])
    areaService.obtenerAreas.mockResolvedValueOnce([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('carga y renderiza secciones', async () => {
    render(
      <BrowserRouter>
        <ConsultarSeccion />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Soporte')).toBeInTheDocument()
      expect(screen.getByText('Área de Administración')).toBeInTheDocument()
    })
  })

  it('llama a obtenerSecciones al montar', () => {
    render(
      <BrowserRouter>
        <ConsultarSeccion />
      </BrowserRouter>,
    )

    expect(seccionService.obtenerSecciones).toHaveBeenCalled()
  })
})
