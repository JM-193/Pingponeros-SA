// CreateFuncion.test.jsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateFunctions from '../pages/CreateFunctions'
import * as functionService from '../services/functionService'

vi.mock('../services/functionService')

describe('CreateFunctions Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza formulario de crear función oficial', () => {
    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Función Oficial/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la función oficial')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese la descripción de la función oficial')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('muestra el subtítulo en la versión de página', () => {
    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Formulario de Registro')).toBeInTheDocument()
  })

  it('no renderiza campo de estado', () => {
    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    expect(screen.queryByText(/Estado/i)).not.toBeInTheDocument()
  })

  it('valida que nombre sea requerido', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre de la función oficial es requerido')).toBeInTheDocument()
  })

  it('valida que descripción sea requerida', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: 'Elaborar informes' },
    })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('La descripción es requerida')).toBeInTheDocument()
  })

  it('crea función oficial correctamente y llama al servicio', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: 'Elaborar informes' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción de la función oficial'), {
      target: { value: 'Redactar informes mensuales' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(functionService.crearFuncion).toHaveBeenCalledWith({
        nombre: 'Elaborar informes',
        descripcion: 'Redactar informes mensuales',
      })
    })
  })

  it('no incluye estado en el payload', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: 'Atención al cliente' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción de la función oficial'), {
      target: { value: 'Brindar atención' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const llamada = functionService.crearFuncion.mock.calls[0][0]
      expect(llamada).not.toHaveProperty('estado')
    })
  })

  it('muestra mensaje de éxito', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: 'Elaborar informes' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción de la función oficial'), {
      target: { value: 'Redactar informes' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Función oficial creada correctamente', expect.anything())
    })
  })

  it('muestra error cuando creación falla', async () => {
    functionService.crearFuncion.mockRejectedValueOnce(new Error('Ya existe una función oficial con ese nombre.'))

    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: 'Elaborar informes' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción de la función oficial'), {
      target: { value: 'Redactar' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ya existe una función oficial con ese nombre.', expect.anything())
    })
  })

  it('limpia el formulario después de envío exitoso', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    const nombreInput = screen.getByPlaceholderText('Nombre de la función oficial')
    const descInput = screen.getByPlaceholderText('Ingrese la descripción de la función oficial')

    fireEvent.change(nombreInput, { target: { value: 'Elaborar informes' } })
    fireEvent.change(descInput, { target: { value: 'Redactar informes' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(nombreInput).toHaveValue('')
      expect(descInput).toHaveValue('')
    })
  })

  it('trimea valores antes de enviar', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: '  Elaborar informes  ' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción de la función oficial'), {
      target: { value: '  Redactar informes  ' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(functionService.crearFuncion).toHaveBeenCalledWith({
        nombre: 'Elaborar informes',
        descripcion: 'Redactar informes',
      })
    })
  })
})

describe('CreateFunctions Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const dialog = document.querySelector('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Crear Función Oficial')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la función oficial')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no muestra el subtítulo en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Formulario de Registro')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombre de la función oficial'), {
      target: { value: 'Elaborar informes' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese la descripción de la función oficial'), {
      target: { value: 'Redactar informes' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Función oficial creada correctamente', expect.anything())
    })

    expect(functionService.crearFuncion).toHaveBeenCalledWith({
      nombre: 'Elaborar informes',
      descripcion: 'Redactar informes',
    })
  })

  it('muestra error de validación en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreateFunctions isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre de la función oficial es requerido')).toBeInTheDocument()
  })
})
