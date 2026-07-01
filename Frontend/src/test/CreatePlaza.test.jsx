// CreatePositions.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreatePositions from '../pages/CreatePositions'
import * as unitService from '../services/unitService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'
import * as areaService from '../services/areaService'

vi.mock('../services/positionService')
vi.mock('../services/unitService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')
vi.mock('../services/areaService')

const mockUnidades = [{ id: 1, nombre: 'Administración' }]
const mockDepartamentos = [{ id: 1, nombre: 'Compras' }]
const mockSecciones = [{ id: 1, nombre: 'Soporte' }]
const mockAreas = [{ id: 1, nombre: 'Central' }]

describe('CreatePositions Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unitService.obtenerUnidades.mockResolvedValue(mockUnidades)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    render(
      <BrowserRouter>
        <CreatePositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de Plaza/i)).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Crear Plaza')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreatePositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de Plaza/i)).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreatePositions isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de Plaza/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra cargando dentro del modal', () => {
    unitService.obtenerUnidades.mockImplementation(() => new Promise(() => {}))
    departmentService.obtenerDepartamentos.mockImplementation(() => new Promise(() => {}))
    sectionService.obtenerSecciones.mockImplementation(() => new Promise(() => {}))
    areaService.obtenerAreas.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <CreatePositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando datos de organización...')).toBeInTheDocument()
  })
})
