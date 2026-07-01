// CreateAreas.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateAreas from '../pages/CreateAreas'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

describe('CreateAreas Modal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal', () => {
    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Crear Área')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese la descripción del área')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar', () => {
    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateAreas isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('valida que nombre sea requerido', async () => {
    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre del área es requerido')).toBeInTheDocument()
  })

  it('valida que descripción sea requerida', async () => {
    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Administración' } })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('La descripción es requerida')).toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('crea área correctamente y llama al servicio', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1, nombre: 'Administración' })

    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Administración' } })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del área'), { target: { value: 'Área de administración' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

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
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del área'), { target: { value: 'Descripción' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Área creada correctamente', expect.anything())
    })
  })

  it('muestra error cuando creación falla', async () => {
    areaService.crearArea.mockRejectedValueOnce(new Error('Área ya existe'))

    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Existing' } })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del área'), { target: { value: 'Desc' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Área ya existe', expect.anything())
    })
  })

  it('limpia el formulario después de envío exitoso', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del área')
    const descInput = screen.getByPlaceholderText('Ingrese la descripción del área')

    fireEvent.change(nombreInput, { target: { value: 'Test Area' } })
    fireEvent.change(descInput, { target: { value: 'Test Description' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(nombreInput).toHaveValue('')
      expect(descInput).toHaveValue('')
    })
  })

  it('trimea valores antes de enviar', async () => {
    areaService.crearArea.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateAreas isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: '  Test  ' } })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del área'), { target: { value: '  Description  ' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(areaService.crearArea).toHaveBeenCalledWith({
        nombre: 'Test',
        descripcion: 'Description',
        estado: 1,
      })
    })
  })
})
