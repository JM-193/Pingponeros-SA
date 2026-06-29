// CreatePuesto.test.jsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateWorkPositions from '../pages/CreateWorkPositions'
import * as workPositionService from '../services/workPositionService'

vi.mock('../services/workPositionService')

describe('CreateWorkPositions Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
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
        <CreateWorkPositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
    expect(document.querySelector('footer')).not.toBeInTheDocument()
  })

  it('no muestra el subtítulo en modo modal', () => {
    render(
      <BrowserRouter>
        <CreateWorkPositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(screen.queryByText('Formulario de Registro')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <BrowserRouter>
        <CreateWorkPositions isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateWorkPositions isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra éxito y llama al servicio en modo modal', async () => {
    workPositionService.crearPuesto.mockResolvedValueOnce({ id: 1 })

    render(
      <BrowserRouter>
        <CreateWorkPositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
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
        <CreateWorkPositions isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El nombre del puesto es requerido')).toBeInTheDocument()
  })
})
