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

describe('CreateAreas Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateAreas isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Crear Área')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateAreas isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateAreas isModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateAreas isModal isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateAreas isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del área'), { target: { value: 'Desc' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(screen.getByText('Área creada correctamente')).toBeInTheDocument()
    })

    expect(areaService.crearArea).toHaveBeenCalledWith({
      nombre: 'Test',
      descripcion: 'Desc',
      estado: 1,
    })
  })

  it('muestra error de validación en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreateAreas isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre del área es requerido')).toBeInTheDocument()
  })
})

