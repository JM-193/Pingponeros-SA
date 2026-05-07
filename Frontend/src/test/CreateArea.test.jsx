// CreateArea.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateArea from '../pages/CreateArea'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

describe('CreateArea Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza formulario de crear área', () => {
    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    expect(screen.getByText('Crear Ãrea')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese la descripción del área')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('valida que nombre sea requerido', async () => {
    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El nombre del área es requerido')).toBeInTheDocument()
    })
  })

  it('valida que descripción sea requerida', async () => {
    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Administración' } })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('La descripción es requerida')).toBeInTheDocument()
    })
  })

  it('crea área correctamente', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1, nombre: 'Administración' })

    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Administración' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Ãrea de administración' } })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(areaService.crearArea).toHaveBeenCalledWith({
        nombre: 'Administración',
        descripcion: 'Ãrea de administración',
      })
    })
  })

  it('muestra mensaje de éxito', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Test' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Descripción' } })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Ãrea creada correctamente')).toBeInTheDocument()
    })
  })

  it('muestra error cuando creación falla', async () => {
    areaService.crearArea.mockRejectedValueOnce(new Error('Ãrea ya existe'))

    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Existing' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Desc' } })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Ãrea ya existe')).toBeInTheDocument()
    })
  })

  it('limpia el formulario después de envÃ­o exitoso', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')

    fireEvent.change(nombreInput, { target: { value: 'Test Area' } })
    fireEvent.change(descInput, { target: { value: 'Test Description' } })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(nombreInput).toHaveValue('')
      expect(descInput).toHaveValue('')
    })
  })

  it('trimea valores antes de enviar', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateArea />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: '  Test  ' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: '  Description  ' } })

    const submitButton = screen.getByRole('button', { name: /Guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(areaService.crearArea).toHaveBeenCalledWith({
        nombre: 'Test',
        descripcion: 'Description',
      })
    })
  })
})

