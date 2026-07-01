// EditSections.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditSections from '../pages/EditSections'
import * as sectionService from '../services/sectionService'
import * as areaService from '../services/areaService'

vi.mock('../services/sectionService')
vi.mock('../services/areaService')

const mockSeccion = {
  nombre: 'Soporte',
  descripcion: 'Sección de soporte',
  idArea: 1,
  estado: 1,
}

const mockAreas = [{ id: 1, nombre: 'Administración' }]

describe('EditSections Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    sectionService.obtenerSeccionPorNombre.mockResolvedValueOnce(mockSeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <EditSections isOpen={true} entityName="Soporte" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Sección')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Soporte')).toBeInTheDocument()
  })

  it('muestra cargando dentro del modal', () => {
    render(
      <BrowserRouter>
        <EditSections isOpen={true} entityName="Soporte" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando sección...')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    sectionService.obtenerSeccionPorNombre.mockResolvedValueOnce(mockSeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <EditSections isOpen={true} entityName="Soporte" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Soporte')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    sectionService.obtenerSeccionPorNombre.mockResolvedValueOnce(mockSeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <EditSections isOpen={true} entityName="Soporte" onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Soporte')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('usa entityName prop en lugar de useParams', async () => {
    sectionService.obtenerSeccionPorNombre.mockResolvedValueOnce(mockSeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <EditSections isOpen={true} entityName="Soporte" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(sectionService.obtenerSeccionPorNombre).toHaveBeenCalledWith('Soporte')
    })
  })
})
