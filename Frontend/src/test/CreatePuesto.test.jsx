// CreatePuesto.test.jsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateWorkPositions from '../pages/CreateWorkPositions'
import * as workPositionService from '../services/workPositionService'

vi.mock('../services/workPositionService')

describe('CreateWorkPositions Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza formulario de crear puesto de trabajo', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Puesto de Trabajo/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del puesto de trabajo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('muestra el subtítulo en la versión de página', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Formulario de Registro')).toBeInTheDocument()
  })

  it('no renderiza campo de estado', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    expect(screen.queryByText(/Estado/i)).not.toBeInTheDocument()
  })

  it('valida que nombre sea requerido', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre del puesto es requerido')).toBeInTheDocument()
  })

  it('valida que descripción sea requerida', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: 'Chofer' },
    })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('La descripción es requerida')).toBeInTheDocument()
  })

  it('crea puesto correctamente y llama al servicio', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: 'Chofer' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo'), {
      target: { value: 'Conductor de vehículos' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(workPositionService.crearPuesto).toHaveBeenCalledWith({
        nombre: 'Chofer',
        descripcion: 'Conductor de vehículos',
      })
    })
  })

  it('no incluye estado en el payload', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: 'Digitador' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo'), {
      target: { value: 'Digitación de datos' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const llamada = workPositionService.crearPuesto.mock.calls[0][0]
      expect(llamada).not.toHaveProperty('estado')
    })
  })

  it('muestra mensaje de éxito', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: 'Chofer' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo'), {
      target: { value: 'Conductor' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Puesto de trabajo creado correctamente', expect.anything())
    })
  })

  it('muestra error cuando creación falla', async () => {
    workPositionService.crearPuesto.mockRejectedValueOnce(new Error('Ya existe un puesto con ese nombre'))

    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: 'Chofer' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo'), {
      target: { value: 'Conductor' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ya existe un puesto con ese nombre', expect.anything())
    })
  })

  it('limpia el formulario después de envío exitoso', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre del puesto de trabajo')
    const descInput = screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo')

    fireEvent.change(nombreInput, { target: { value: 'Chofer' } })
    fireEvent.change(descInput, { target: { value: 'Conductor' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(nombreInput).toHaveValue('')
      expect(descInput).toHaveValue('')
    })
  })

  it('trimea valores antes de enviar', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: '  Chofer  ' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo'), {
      target: { value: '  Conductor  ' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(workPositionService.crearPuesto).toHaveBeenCalledWith({
        nombre: 'Chofer',
        descripcion: 'Conductor',
      })
    })
  })
})

describe('CreateWorkPositions Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Crear Puesto de Trabajo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del puesto de trabajo')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no muestra el subtítulo en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Formulario de Registro')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre del puesto de trabajo'), {
      target: { value: 'Digitador' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción del puesto de trabajo'), {
      target: { value: 'Digitación' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Puesto de trabajo creado correctamente', expect.anything())
    })

    expect(workPositionService.crearPuesto).toHaveBeenCalledWith({
      nombre: 'Digitador',
      descripcion: 'Digitación',
    })
  })

  it('muestra error de validación en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre del puesto es requerido')).toBeInTheDocument()
  })
})
