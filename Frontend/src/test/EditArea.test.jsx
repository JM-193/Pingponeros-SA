// EditArea.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import EditArea from '../pages/EditArea'
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
        <Route path="/organizacion/areas/editar/:nombre" element={<EditArea />} />
        <Route path="/organizacion/areas/consultar" element={<div>Lista de áreas</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('EditArea Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditArea />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando área...')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <EditArea />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('renderiza Footer', () => {
    render(
      <BrowserRouter>
        <EditArea />
      </BrowserRouter>,
    )

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('tiene layout con full height', () => {
    const { container } = render(
      <BrowserRouter>
        <EditArea />
      </BrowserRouter>,
    )

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveStyle('min-height: 100vh')
    expect(mainDiv).toHaveStyle('display: flex')
  })

  it('contiene elemento main', () => {
    const { container } = render(
      <BrowserRouter>
        <EditArea />
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

