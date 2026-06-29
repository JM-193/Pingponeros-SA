// CreateFuncion.test.jsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateFunctions from '../pages/CreateFunctions'
import * as functionService from '../services/functionService'

vi.mock('../services/functionService')

describe('CreateFunctions Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateFunctions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
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
        <CreateFunctions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no muestra el subtítulo en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateFunctions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Formulario de Registro')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateFunctions isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateFunctions isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    functionService.crearFuncion.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateFunctions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
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
        <CreateFunctions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre de la función oficial es requerido')).toBeInTheDocument()
  })
})
