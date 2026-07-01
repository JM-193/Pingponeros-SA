// EditPositions.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditPositions from '../pages/EditPositions'
import * as positionService from '../services/positionService'
import * as unitService from '../services/unitService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'
import * as areaService from '../services/areaService'

vi.mock('../services/positionService')
vi.mock('../services/unitService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')
vi.mock('../services/areaService')

const mockPlaza = {
  numeroPlaza: 7,
  idArea: 1,
  idDepartamento: 1,
  idSeccion: null,
  idUnidad: 1,
}

const mockAreas = [{ id: 1, nombre: 'Central' }, { id: 2, nombre: 'TI' }]
const mockDepartamentos = [
  { id: 1, nombre: 'Compras', idArea: 1 },
  { id: 2, nombre: 'Ventas', idArea: 2 },
]
const mockSecciones = [
  { id: 1, nombre: 'Soporte', idArea: 1 },
  { id: 2, nombre: 'Logística', idArea: 2 },
]
const mockUnidades = [
  { id: 1, nombre: 'Unidad A', idArea: 1, idDepartamento: 1 },
  { id: 2, nombre: 'Unidad B', idArea: 2, idDepartamento: 2 },
]

describe('EditPositions Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    positionService.obtenerPlazaPorNumero.mockResolvedValue(mockPlaza)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    unitService.obtenerUnidades.mockResolvedValue(mockUnidades)
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    render(
      <BrowserRouter>
        <EditPositions isOpen={true} entityId="7" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('muestra cargando dentro del modal', () => {
    positionService.obtenerPlazaPorNumero.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <EditPositions isOpen={true} entityId="7" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Cargando datos de la plaza/i)).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    render(
      <BrowserRouter>
        <EditPositions isOpen={true} entityId="7" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <EditPositions isOpen={true} entityId="7" onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Plaza/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('usa entityId prop en lugar de useParams', async () => {
    render(
      <BrowserRouter>
        <EditPositions isOpen={true} entityId="7" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(positionService.obtenerPlazaPorNumero).toHaveBeenCalledWith('7')
    })
  })
})
