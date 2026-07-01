// CreateClaseOcupacional.test.jsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import CreateOccupationalClasses from '../pages/CreateOccupationalClasses'
import * as occupationalClassService from '../services/occupationalClassService'

vi.mock('../services/occupationalClassService')

const renderModal = (props = {}) =>
  render(
    <BrowserRouter>
      <CreateOccupationalClasses isOpen={true} onClose={() => {}} onSuccess={() => {}} {...props} />
    </BrowserRouter>,
  )

describe('CreateOccupationalClasses Modal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal con título y campos', () => {
    renderModal()

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Crear Clase Ocupacional')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese el código de la clase ocupacional')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingrese el nombre de la clase ocupacional')).toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.querySelector('dialog')).toBeNull()
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra error de validación cuando el código está vacío', async () => {
    renderModal()

    fireEvent.change(screen.getByPlaceholderText('Ingrese el nombre de la clase ocupacional'), {
      target: { value: 'Profesional 1' },
    })
    await act(async () => { fireEvent.submit(document.querySelector('form')) })

    expect(screen.getByText('El código es requerido')).toBeInTheDocument()
    expect(occupationalClassService.crearClaseOcupacional).not.toHaveBeenCalled()
  })

  it('muestra error cuando el código no es un entero positivo', async () => {
    renderModal()

    fireEvent.change(screen.getByPlaceholderText('Ingrese el código de la clase ocupacional'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese el nombre de la clase ocupacional'), {
      target: { value: 'Profesional 1' },
    })
    await act(async () => { fireEvent.submit(document.querySelector('form')) })

    expect(screen.getByText('El código debe ser un número entero positivo')).toBeInTheDocument()
  })

  it('muestra error de validación cuando el nombre está vacío', async () => {
    renderModal()

    fireEvent.change(screen.getByPlaceholderText('Ingrese el código de la clase ocupacional'), {
      target: { value: '100' },
    })
    await act(async () => { fireEvent.submit(document.querySelector('form')) })

    expect(screen.getByText('El nombre de la clase ocupacional es requerido')).toBeInTheDocument()
  })

  it('sanitiza caracteres no permitidos en el nombre', () => {
    renderModal()

    const nombreInput = screen.getByPlaceholderText('Ingrese el nombre de la clase ocupacional')
    fireEvent.change(nombreInput, { target: { value: 'Profesional<>1' } })

    expect(nombreInput.value).toBe('Profesional1')
  })

  it('crea la clase y muestra éxito cuando el formulario es válido', async () => {
    occupationalClassService.crearClaseOcupacional.mockResolvedValueOnce({ idClaseOcupacional: 1 })

    renderModal()

    fireEvent.change(screen.getByPlaceholderText('Ingrese el código de la clase ocupacional'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese el nombre de la clase ocupacional'), {
      target: { value: 'Profesional 1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(occupationalClassService.crearClaseOcupacional).toHaveBeenCalledWith({
        codigo: 100,
        nombre: 'Profesional 1',
      })
    })
    expect(toast.success).toHaveBeenCalledWith('Clase ocupacional creada correctamente', expect.anything())
  })

  it('notifica error cuando el servicio falla', async () => {
    occupationalClassService.crearClaseOcupacional.mockRejectedValueOnce(
      Object.assign(new Error('Ya existe una clase ocupacional con ese nombre.'), { status: 409 }),
    )

    renderModal()

    fireEvent.change(screen.getByPlaceholderText('Ingrese el código de la clase ocupacional'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingrese el nombre de la clase ocupacional'), {
      target: { value: 'Profesional 1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Ya existe una clase ocupacional con ese nombre.',
        expect.anything(),
      )
    })
  })
})
