// DeclarationActivityModal.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import DeclarationActivityModal from '../components/DeclarationActivityModal'

const mockPropias = [
  { id: 1, nombre: 'Elaborar informes', descripcion: 'Redactar informes mensuales' },
  { id: 2, nombre: 'Gestionar expedientes', descripcion: 'Archivar y gestionar expedientes' },
]

const mockComplemento = [
  { id: 3, nombre: 'Apoyo administrativo', descripcion: 'Tareas de apoyo' },
]

const mockDefinidas = [
  { id: 4, nombre: 'Función personal A', descripcion: 'Descripción personal A' },
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  propias: mockPropias,
  complemento: mockComplemento,
  definidas: mockDefinidas,
  onAgregar: vi.fn(),
  onCrearDefinida: vi.fn(),
}

describe('DeclarationActivityModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el modal cuando isOpen es true', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    expect(screen.getByRole('heading', { name: /Agregar Función/i })).toBeInTheDocument()
  })

  it('no renderiza el modal cuando isOpen es false', () => {
    render(<DeclarationActivityModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('heading', { name: /Agregar Función/i })).not.toBeInTheDocument()
  })

  it('renderiza el selector de tipo de función', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    expect(screen.getByLabelText(/Tipo de función/i)).toBeInTheDocument()
  })

  it('no muestra el selector de función hasta que se elija un tipo', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    expect(screen.queryByRole('combobox', { name: /^Función/i })).not.toBeInTheDocument()
  })

  it('muestra el selector de función después de elegir el tipo "Propia de mi puesto"', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Propia de mi puesto' },
    })

    expect(screen.getByRole('combobox', { name: /^Función/i })).toBeInTheDocument()
  })

  it('muestra las funciones propias del puesto al elegir tipo "Propia de mi puesto"', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Propia de mi puesto' },
    })

    expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
    expect(screen.getByText('Gestionar expedientes')).toBeInTheDocument()
  })

  it('muestra las funciones de complemento al elegir tipo "De otro puesto"', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'De otro puesto' },
    })

    expect(screen.getByText('Apoyo administrativo')).toBeInTheDocument()
  })

  it('muestra las funciones de complemento al elegir tipo "De apoyo ocasional"', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'De apoyo ocasional' },
    })

    expect(screen.getByText('Apoyo administrativo')).toBeInTheDocument()
  })

  it('muestra funciones definidas y opción "Crear nueva" al elegir tipo "Definida por mí"', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Definida por mí' },
    })

    expect(screen.getByText('Función personal A')).toBeInTheDocument()
    expect(screen.getByText(/Crear nueva función/i)).toBeInTheDocument()
  })

  it('muestra campos de nombre y descripción al elegir "Crear nueva función"', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Definida por mí' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /^Función/i }), {
      target: { value: '__nueva__' },
    })

    expect(screen.getByLabelText(/Nombre de la nueva función/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
  })

  it('renderiza los campos de periodicidad, veces realizadas y duración', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    expect(screen.getByLabelText(/Periodicidad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Cantidad de veces/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Duración/i)).toBeInTheDocument()
  })

  it('muestra error de validación si se intenta agregar sin seleccionar tipo', async () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Seleccione el tipo de función/i)).toBeInTheDocument()
    })
  })

  it('muestra error de validación si no se selecciona función', async () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Propia de mi puesto' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/i }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /^Función/i })).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('muestra error de validación si no se selecciona periodicidad', async () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Propia de mi puesto' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /^Función/i }), {
      target: { value: '1' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Periodicidad/i)).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('llama a onAgregar con los datos correctos cuando el formulario es válido', async () => {
    const onAgregar = vi.fn()
    render(<DeclarationActivityModal {...defaultProps} onAgregar={onAgregar} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Propia de mi puesto' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /^Función/i }), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByLabelText(/Periodicidad/i), {
      target: { value: 'Semanal' },
    })
    fireEvent.change(screen.getByLabelText(/Cantidad de veces/i), {
      target: { value: '3' },
    })
    fireEvent.change(screen.getByLabelText(/Duración/i), {
      target: { value: '45' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/i }))

    await waitFor(() => {
      expect(onAgregar).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoFuncion: 'Propia de mi puesto',
          idFuncion: 1,
          idFuncionPropia: null,
          nombre: 'Elaborar informes',
          periodicidad: 'Semanal',
          vecesRealizadas: 3,
          duracion: 45,
        }),
      )
    })
  })

  it('llama a onClose al hacer clic en Cancelar', () => {
    const onClose = vi.fn()
    render(<DeclarationActivityModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('reinicia el formulario al cambiar el tipo de función', () => {
    render(<DeclarationActivityModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Propia de mi puesto' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /^Función/i }), {
      target: { value: '1' },
    })

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'De otro puesto' },
    })

    expect(screen.getByRole('combobox', { name: /^Función/i }).value).toBe('')
  })

  it('llama a onCrearDefinida cuando se agrega una función nueva "Definida por mí"', async () => {
    const creada = { id: 99, nombre: 'Nueva función', descripcion: 'Desc nueva' }
    const onCrearDefinida = vi.fn().mockResolvedValue(creada)
    const onAgregar = vi.fn()

    render(
      <DeclarationActivityModal
        {...defaultProps}
        onCrearDefinida={onCrearDefinida}
        onAgregar={onAgregar}
      />,
    )

    fireEvent.change(screen.getByLabelText(/Tipo de función/i), {
      target: { value: 'Definida por mí' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /^Función/i }), {
      target: { value: '__nueva__' },
    })
    fireEvent.change(screen.getByLabelText(/Nombre de la nueva función/i), {
      target: { value: 'Nueva función' },
    })
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
      target: { value: 'Desc nueva' },
    })
    fireEvent.change(screen.getByLabelText(/Periodicidad/i), {
      target: { value: 'Diario' },
    })
    fireEvent.change(screen.getByLabelText(/Cantidad de veces/i), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByLabelText(/Duración/i), {
      target: { value: '30' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/i }))

    await waitFor(() => {
      expect(onCrearDefinida).toHaveBeenCalledWith('Nueva función', 'Desc nueva')
      expect(onAgregar).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoFuncion: 'Definida por mí',
          idFuncionPropia: 99,
          idFuncion: null,
        }),
      )
    })
  })
})
