// CreateUsers.test.jsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateUsers from '../pages/CreateUsers'
import * as userService from '../services/userService'

vi.mock('../services/userService')

describe('CreateUsers Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateUsers isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Crear Usuario')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateUsers isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUsers isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateUsers isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    userService.crearUsuario.mockResolvedValueOnce({ mensaje: 'Usuario creado correctamente.' })

    const { container } = render(
      <BrowserRouter>
        <CreateUsers isOpen={true} onClose={() => {}} onSuccess={() => {}} />
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
        <CreateUsers isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = container.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El correo es requerido')).toBeInTheDocument()
  })
})

