// CreateUnits.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateUnits from '../pages/CreateUnits'
import * as areaService from '../services/areaService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'

vi.mock('../services/unitService')
vi.mock('../services/areaService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')

describe('CreateUnits Modal Mode', () => {
  const mockAreas = [
    { id: 1, nombre: 'Administración' },
  ]
  const mockDepartamentos = [
    { id: 1, idArea: 1, nombre: 'Compras' },
  ]
  const mockSecciones = [
    { id: 1, idArea: 1, nombre: 'Soporte' },
  ]

  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    render(
      <BrowserRouter>
        <CreateUnits isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Crear Unidad')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreateUnits isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateUnits isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra cargando dentro del modal', () => {
    areaService.obtenerAreas.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <CreateUnits isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando datos de organización...')).toBeInTheDocument()
  })
})
