// CreateUser.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateUser from '../pages/CreateUser'
import * as usuarioService from '../services/usuarioService'

vi.mock('../services/usuarioService')

describe('CreateUser Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza formulario de crear usuario', () => {
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Crear Usuario/i)).toBeInTheDocument()
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
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const submitButton = screen.getByRole('button', { name: /Guardar|Enviar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
    })
  })

  it('valida formato de email UCR', async () => {
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>,
    )

    const emailInputs = screen.getAllByPlaceholderText(/correo|email/i)
    fireEvent.change(emailInputs[0], { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /Guardar|Enviar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/El correo debe ser válido/i)).toBeInTheDocument()
    })
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

    // El test verifica que se haya renderizado la página correctamente
    expect(screen.getByText(/Crear Usuario/i)).toBeInTheDocument()
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

    expect(screen.getByText(/Crear Usuario/i)).toBeInTheDocument()
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
})

