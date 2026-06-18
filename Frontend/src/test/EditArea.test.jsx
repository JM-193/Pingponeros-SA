// EditAreas.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import EditAreas from '../pages/EditAreas'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

const mockArea = {
  nombre: 'Administración',
  descripcion: 'Área de administración general',
  estado: 1,
}

const renderWithRoute = (nombre) =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/areas/editar/${nombre}`]}>
      <Routes>
        <Route path="/organizacion/areas/editar/:nombre" element={<EditAreas />} />
        <Route path="/organizacion/areas/consultar" element={<div>Lista de áreas</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('EditAreas Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditAreas />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando área...')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <EditAreas />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <EditAreas />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('tiene layout con full height', () => {
    const { container } = render(
      <BrowserRouter>
        <EditAreas />
      </BrowserRouter>,
    )

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveStyle('min-height: 100vh')
    expect(mainDiv).toHaveStyle('display: flex')
  })

  it('contiene elemento main', () => {
    const { container } = render(
      <BrowserRouter>
        <EditAreas />
      </BrowserRouter>,
    )

    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveStyle('flex: 1')
  })

  it('carga y renderiza el formulario con los datos del área', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)

    renderWithRoute('Administración')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Área/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Administración')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Área de administración general')).toBeInTheDocument()
  })

  it('muestra error de validación cuando nombre está vacío al enviar', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)

    renderWithRoute('Administración')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    })

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: '' } })

    fireEvent.submit(nombreInput.closest('form'))

    await waitFor(() => {
      expect(screen.getByText('El nombre del área es requerido')).toBeInTheDocument()
    })
  })

  it('actualiza área correctamente y redirige', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)
    areaService.actualizarArea.mockResolvedValueOnce({})

    renderWithRoute('Administración')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Área actualizada correctamente')).toBeInTheDocument()
    })
  })

  it('muestra error cuando la actualización falla', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)
    areaService.actualizarArea.mockRejectedValueOnce(new Error('Error al actualizar'))

    renderWithRoute('Administración')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error al actualizar')).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la carga del área', async () => {
    areaService.obtenerAreaPorNombre.mockRejectedValueOnce(new Error('Área no encontrada'))

    renderWithRoute('Inexistente')

    await waitFor(() => {
      expect(screen.getByText('Área no encontrada')).toBeInTheDocument()
    })
  })
})

describe('EditAreas Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValueOnce(mockArea)

    render(
      <BrowserRouter>
        <EditAreas isModal isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
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
        <EditAreas isModal isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
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
        <EditAreas isModal isOpen={true} entityName="Test" onClose={() => {}} onSuccess={() => {}} />
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
        <EditAreas isModal isOpen={true} entityName="Administración" onClose={onClose} onSuccess={() => {}} />
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
        <EditAreas isModal isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Administración')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }))

    await waitFor(() => {
      expect(screen.getByText('Área actualizada correctamente')).toBeInTheDocument()
    })

    expect(areaService.actualizarArea).toHaveBeenCalled()
  })

  it('usa entityName prop en lugar de useParams', async () => {
    areaService.obtenerAreaPorNombre.mockResolvedValue(mockArea)

    render(
      <BrowserRouter>
        <EditAreas isModal isOpen={true} entityName="Administración" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(areaService.obtenerAreaPorNombre).toHaveBeenCalledWith('Administración')
    })
  })
})

