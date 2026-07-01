// EditAreas.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import EditAreas from '../pages/EditAreas'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

const mockArea = {
  nombre: 'Administración',
  descripcion: 'Área de administración general',
  estado: 1,
}

describe('EditAreas Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)

    render(
      <BrowserRouter>
        <EditAreas isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Área/i })).toBeInTheDocument()
    })

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByDisplayValue('Administración')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)

    render(
      <BrowserRouter>
        <EditAreas isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Administración')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('muestra cargando dentro del modal', () => {
    render(
      <BrowserRouter>
        <EditAreas isOpen={true} entityName="Test" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Cargando área...')).toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <EditAreas isOpen={true} entityName="Administración" onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Administración')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)
    areaService.actualizarArea.mockResolvedValueOnce({})

    render(
      <BrowserRouter>
        <EditAreas isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Administración')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Área actualizada correctamente', expect.anything())
    })

    expect(areaService.actualizarArea).toHaveBeenCalled()
  })

  it('usa entityName prop en lugar de useParams', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValue(mockArea)

    render(
      <BrowserRouter>
        <EditAreas isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(areaService.obtenerAreaPorNombre).toHaveBeenCalledWith('Administración')
    })
  })
})

