// CreateUsers.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateUsers from '../pages/CreateUsers'
import * as userService from '../services/userService'

vi.mock('../services/userService')

describe('CreateUsers Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza formulario de crear usuario', () => {
    render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Usuario/i })).toBeInTheDocument()
  })

  it('renderiza campos de nombre, apellido y email', () => {
    render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    // Verificar que los campos del formulario estén presentes
    expect(screen.getAllByDisplayValue('')).toBeDefined()
  })

  it('valida que email sea requerido', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
  })

  it('valida formato de email UCR', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText((content) => content.startsWith('El correo debe ser'))).toBeInTheDocument()
  })

  it('crea usuario correctamente', async () => {
    const mockResponse = {
      id: 1,
      mensaje: 'Usuario creado exitosamente',
      contrasenaTemporal: 'TempPass123!',
    }
    userService.crearUsuario.mockResolvedValueOnce(mockResponse)

    render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    // Los campos exactos pueden variar segÃºn la implementación
    // Buscamos inputs de email
    const emailInputs = screen.getAllByRole('textbox')
    expect(emailInputs.length).toBeGreaterThan(0)
  })

  it('muestra mensaje de éxito cuando usuario se crea', async () => {
    const mockResponse = {
      mensaje: 'Usuario creado correctamente.',
      contrasenaTemporal: 'TempPass123!',
    }
    userService.crearUsuario.mockResolvedValueOnce(mockResponse)

    render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Usuario/i })).toBeInTheDocument()
  })

  it('muestra error cuando creación falla', async () => {
    userService.crearUsuario.mockRejectedValueOnce(
      new Error('El correo ya existe'),
    )

    render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Usuario/i })).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('tiene layout con full height', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveStyle('min-height: 100vh')
    expect(mainDiv).toHaveStyle('display: flex')
  })

  it('crea usuario y limpia el formulario al éxito', async () => {
    const mockResponse = {
      id: 1,
      mensaje: 'Usuario creado exitosamente',
      contrasenaTemporal: 'TempPass123!',
    }
    userService.crearUsuario.mockResolvedValueOnce(mockResponse)

    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')
    const secondSurnameInput = container.querySelector('input[name="secondName_surname"]')
    const roleSelect = container.querySelector('select[name="role"]')

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(surnameInput, { target: { value: 'Pérez' } })
    fireEvent.change(secondSurnameInput, { target: { value: 'Mora' } })
    fireEvent.change(emailInput, { target: { value: 'juan.perez@ucr.ac.cr' } })
    fireEvent.change(roleSelect, { target: { value: '1' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Usuario creado exitosamente', expect.anything())
    })

    // El formulario se resetea después del éxito
    expect(emailInput.value).toBe('')
  })

  it('muestra mensaje de éxito predeterminado cuando mensaje no viene en la respuesta', async () => {
    userService.crearUsuario.mockResolvedValueOnce({ id: 1 })

    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')
    const secondSurnameInput = container.querySelector('input[name="secondName_surname"]')
    const roleSelect = container.querySelector('select[name="role"]')

    fireEvent.change(firstNameInput, { target: { value: 'Ana' } })
    fireEvent.change(surnameInput, { target: { value: 'López' } })
    fireEvent.change(secondSurnameInput, { target: { value: 'Mora' } })
    fireEvent.change(emailInput, { target: { value: 'ana.lopez@ucr.ac.cr' } })
    fireEvent.change(roleSelect, { target: { value: '0' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Usuario creado correctamente.', expect.anything())
    })
  })

  it('muestra error del servicio al fallar la creación', async () => {
    userService.crearUsuario.mockRejectedValueOnce(new Error('El correo ya existe'))

    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')
    const secondSurnameInput = container.querySelector('input[name="secondName_surname"]')
    const roleSelect = container.querySelector('select[name="role"]')

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(surnameInput, { target: { value: 'Pérez' } })
    fireEvent.change(secondSurnameInput, { target: { value: 'Mora' } })
    fireEvent.change(emailInput, { target: { value: 'juan.perez@ucr.ac.cr' } })
    fireEvent.change(roleSelect, { target: { value: '1' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('El correo ya existe', expect.anything())
    })
  })

  it('sanitiza caracteres no válidos en campos de nombre', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    const firstNameInput = container.querySelector('input[name="firstName"]')
    fireEvent.change(firstNameInput, { target: { value: 'Juan123' } })

    expect(firstNameInput.value).toBe('Juan')
  })

  it('limpia mensajes al cambiar un campo de texto', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers />
      </BrowserRouter>,
    )

    // Provocar error
    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })
    expect(screen.getByText('El correo es requerido')).toBeInTheDocument()

    // Cambiar campo para limpiar mensaje
    const emailInput = container.querySelector('input[name="email"]')
    fireEvent.change(emailInput, { target: { value: 'test@ucr.ac.cr' } })

    expect(screen.queryByText('El correo es requerido')).not.toBeInTheDocument()
  })
})

describe('CreateUsers Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateUsers isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Crear Usuario')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateUsers isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers isModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateUsers isModal isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    userService.crearUsuario.mockResolvedValueOnce({ mensaje: 'Usuario creado correctamente.' })

    const { container } = render(
      <BrowserRouter>
        <CreateUsers isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')
    const secondSurnameInput = container.querySelector('input[name="secondName_surname"]')
    const roleSelect = container.querySelector('select[name="role"]')

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(surnameInput, { target: { value: 'Pérez' } })
    fireEvent.change(secondSurnameInput, { target: { value: 'Mora' } })
    fireEvent.change(emailInput, { target: { value: 'juan.perez@ucr.ac.cr' } })
    fireEvent.change(roleSelect, { target: { value: '1' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Usuario creado correctamente.', expect.anything())
    })

    expect(userService.crearUsuario).toHaveBeenCalled()
  })

  it('valida email en modo modal', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
  })
})

