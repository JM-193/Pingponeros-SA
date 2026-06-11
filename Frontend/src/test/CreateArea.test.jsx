// CreateAreas.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateAreas from '../pages/CreateAreas'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

describe('CreateAreas Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza formulario de crear área', () => {
    render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Área/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese la descripción del área')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('valida que nombre sea requerido', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre del área es requerido')).toBeInTheDocument()
  })

  it('valida que descripción sea requerida', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Administración' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('La descripción es requerida')).toBeInTheDocument()
  })

  it('crea área correctamente', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1, nombre: 'Administración' })

    render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Administración' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Área de administración' } })

    const submitButton = screen.getByRole('button', { name: /Crear/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(areaService.crearArea).toHaveBeenCalledWith({
        nombre: 'Administración',
        descripcion: 'Área de administración',
        estado: 1,
      })
    })
  })

  it('muestra mensaje de éxito', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Test' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Descripción' } })

    const submitButton = screen.getByRole('button', { name: /Crear/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Área creada correctamente')).toBeInTheDocument()
    })
  })

  it('muestra error cuando creación falla', async () => {
    areaService.crearArea.mockRejectedValueOnce(new Error('Área ya existe'))

    render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: 'Existing' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: 'Desc' } })

    const submitButton = screen.getByRole('button', { name: /Crear/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Área ya existe')).toBeInTheDocument()
    })
  })

  it('limpia el formulario después de envío exitoso', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateAreas />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')

    fireEvent.change(nombreInput, { target: { value: 'Test Area' } })
    fireEvent.change(descInput, { target: { value: 'Test Description' } })

    const submitButton = screen.getByRole('button', { name: /Crear/i })
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
        <CreateAreas />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    fireEvent.change(nombreInput, { target: { value: '  Test  ' } })

    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')
    fireEvent.change(descInput, { target: { value: '  Description  ' } })

    const submitButton = screen.getByRole('button', { name: /Crear/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(areaService.crearArea).toHaveBeenCalledWith({
        nombre: 'Test',
        descripcion: 'Description',
        estado: 1,
      })
    })
  })
})

