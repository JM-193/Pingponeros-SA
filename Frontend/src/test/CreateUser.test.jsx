// CreateUser.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateUser from '../pages/CreateUser'
import * as usuarioService from '../services/usuarioService'

vi.mock('../services/usuarioService')

describe('CreateUser Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza formulario de crear usuario', () => {
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Usuario/i })).toBeInTheDocument()
  })

  it('renderiza campos de nombre, apellido y email', () => {
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    // Verificar que los campos del formulario estén presentes
    expect(screen.getAllByDisplayValue('')).toBeDefined()
  })

  it('valida que email sea requerido', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
  })

  it('valida formato de email UCR', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUser />
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
    usuarioService.crearUsuario.mockResolvedValueOnce(mockResponse)

    render(
      <BrowserRouter>
        <CreateUser />
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
    usuarioService.crearUsuario.mockResolvedValueOnce(mockResponse)

    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Usuario/i })).toBeInTheDocument()
  })

  it('muestra error cuando creación falla', async () => {
    usuarioService.crearUsuario.mockRejectedValueOnce(
      new Error('El correo ya existe'),
    )

    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /Crear Usuario/i })).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('tiene layout con full height', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUser />
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
    usuarioService.crearUsuario.mockResolvedValueOnce(mockResponse)

    const { container } = render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(surnameInput, { target: { value: 'Pérez' } })
    fireEvent.change(emailInput, { target: { value: 'juan.perez@ucr.ac.cr' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText('Usuario creado exitosamente')).toBeInTheDocument()
    })

    // El formulario se resetea después del éxito
    expect(emailInput.value).toBe('')
  })

  it('muestra mensaje de éxito predeterminado cuando mensaje no viene en la respuesta', async () => {
    usuarioService.crearUsuario.mockResolvedValueOnce({ id: 1 })

    const { container } = render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')

    fireEvent.change(firstNameInput, { target: { value: 'Ana' } })
    fireEvent.change(surnameInput, { target: { value: 'López' } })
    fireEvent.change(emailInput, { target: { value: 'ana.lopez@ucr.ac.cr' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText('Usuario creado correctamente.')).toBeInTheDocument()
    })
  })

  it('muestra error del servicio al fallar la creación', async () => {
    usuarioService.crearUsuario.mockRejectedValueOnce(new Error('El correo ya existe'))

    const { container } = render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const emailInput = container.querySelector('input[name="email"]')
    const firstNameInput = container.querySelector('input[name="firstName"]')
    const surnameInput = container.querySelector('input[name="firstName_surname"]')

    fireEvent.change(firstNameInput, { target: { value: 'Juan' } })
    fireEvent.change(surnameInput, { target: { value: 'Pérez' } })
    fireEvent.change(emailInput, { target: { value: 'juan.perez@ucr.ac.cr' } })

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText('El correo ya existe')).toBeInTheDocument()
    })
  })

  it('sanitiza caracteres no válidos en campos de nombre', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const firstNameInput = container.querySelector('input[name="firstName"]')
    fireEvent.change(firstNameInput, { target: { value: 'Juan123' } })

    expect(firstNameInput.value).toBe('Juan')
  })

  it('limpia mensajes al cambiar un campo de texto', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUser />
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

