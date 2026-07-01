// DeclarationForm.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DeclarationForm from '../pages/DeclarationForm'
import * as session from '../services/session'
import * as declarationService from '../services/declarationService'
import * as functionService from '../services/functionService'
import * as workPositionService from '../services/workPositionService'
import * as userFunctionService from '../services/userFunctionService'

vi.mock('../services/session')
vi.mock('../services/declarationService')
vi.mock('../services/functionService')
vi.mock('../services/workPositionService')
vi.mock('../services/userFunctionService')

const mockSesion = {
  correoInstitucional: 'juan@ucr.ac.cr',
  primerNombre: 'Juan',
  segundoNombre: null,
  primerApellido: 'Pérez',
  segundoApellido: 'García',
  rol: 0,
}

const mockAutocompletado = [
  {
    numeroPlaza: 100,
    idPuesto: 1,
    cargo: 'Analista de Sistemas',
    claseOcupacional: 'Profesional',
    lugarTrabajo: 'Edificio Central',
    titular: '',
  },
]

const mockFuncionesUsuario = [
  { id: 1, nombre: 'Función propia A', descripcion: 'Desc A' },
]

function renderForm() {
  return render(
    <BrowserRouter>
      <DeclarationForm />
    </BrowserRouter>,
  )
}

describe('DeclarationForm Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue(mockSesion)
    declarationService.obtenerAutocompletado.mockResolvedValue(mockAutocompletado)
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(null)
    userFunctionService.obtenerFuncionesUsuarioPorCorreo.mockResolvedValue(mockFuncionesUsuario)
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([])
    functionService.obtenerFunciones.mockResolvedValue([])
  })

  it('muestra estado de carga inicial', () => {
    declarationService.obtenerAutocompletado.mockImplementation(() => new Promise(() => {}))
    declarationService.obtenerDeclaracionActiva.mockImplementation(() => new Promise(() => {}))
    userFunctionService.obtenerFuncionesUsuarioPorCorreo.mockImplementation(() => new Promise(() => {}))

    renderForm()

    expect(screen.getByText(/Cargando declaración/i)).toBeInTheDocument()
  })

  it('muestra mensaje cuando el usuario no tiene plazas asignadas', async () => {
    declarationService.obtenerAutocompletado.mockResolvedValue([])

    renderForm()

    await waitFor(() => {
      expect(screen.getByText(/No tiene plazas asignadas/i)).toBeInTheDocument()
    })
  })

  it('renderiza el paso 1 con campos de información general', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Jornada Laboral/i)).toBeInTheDocument()
    })
  })

  it('renderiza el selector de número de plaza', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })
  })

  it('renderiza los campos de horario laboral', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Inicio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Finaliza/i)).toBeInTheDocument()
    })
  })

  it('muestra error de validación si se intenta avanzar sin plaza', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('muestra error de validación si se intenta avanzar sin jornada', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    const selectPlaza = screen.getByLabelText(/Número de plaza/i)
    fireEvent.change(selectPlaza, { target: { value: '100' } })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Jornada Laboral/i)).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('renderiza el botón "Cancelar declaración" en el paso 1', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancelar declaración/i })).toBeInTheDocument()
    })
  })

  it('renderiza el botón "Siguiente" en el paso 1', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeInTheDocument()
    })
  })

  it('autocompleta cargo y clase ocupacional al seleccionar plaza', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '100' } })

    await waitFor(() => {
      const cargoInput = screen.getByLabelText(/Cargo del puesto/i)
      expect(cargoInput.value).toBe('Analista de Sistemas')
    })
  })

  it('restablece el formulario si no se selecciona ninguna plaza', async () => {
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '' } })

    const cargoInput = screen.getByLabelText(/Cargo del puesto/i)
    expect(cargoInput.value).toBe('')
  })

  it('carga la declaración activa preexistente al montar', async () => {
    const declaracionActiva = {
      declaracion: { id: 5, numeroPlaza: 100, completa: 0 },
      horario: { horaEntrada: '08:00', horaSalida: '16:00', jornadaLaboral: 'Tiempo Completo' },
      descanso: { tiempo: 30 },
      horaExtra: null,
      permisoAusencia: null,
      actividades: [],
      cargo: 'Analista de Sistemas',
      claseOcupacional: 'Profesional',
      lugarTrabajo: 'Edificio Central',
    }
    declarationService.obtenerDeclaracionActiva.mockResolvedValue(declaracionActiva)

    renderForm()

    await waitFor(() => {
      const selectPlaza = screen.getByLabelText(/Número de plaza/i)
      expect(selectPlaza).toBeDisabled()
    })
  })

  it('muestra paso 2 (Diagnóstico) cuando se avanza correctamente', async () => {
    declarationService.crearDeclaracion.mockResolvedValue({ id: 10 })
    declarationService.guardarDeclaracion.mockResolvedValue({})

    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/Jornada Laboral/i), { target: { value: 'Tiempo Completo' } })
    fireEvent.change(screen.getByLabelText(/Inicio/i), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText(/Finaliza/i), { target: { value: '17:00' } })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByText(/Diagnóstico de la Carga de Trabajo/i)).toBeInTheDocument()
    })
  })

  it('muestra botón "Regresar" en el paso 2', async () => {
    declarationService.crearDeclaracion.mockResolvedValue({ id: 10 })
    declarationService.guardarDeclaracion.mockResolvedValue({})

    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/Jornada Laboral/i), { target: { value: 'Tiempo Completo' } })
    fireEvent.change(screen.getByLabelText(/Inicio/i), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText(/Finaliza/i), { target: { value: '17:00' } })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Regresar/i })).toBeInTheDocument()
    })
  })

  it('regresa al paso 1 desde el paso 2 al hacer clic en Regresar', async () => {
    declarationService.crearDeclaracion.mockResolvedValue({ id: 10 })
    declarationService.guardarDeclaracion.mockResolvedValue({})

    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/Jornada Laboral/i), { target: { value: 'Tiempo Completo' } })
    fireEvent.change(screen.getByLabelText(/Inicio/i), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText(/Finaliza/i), { target: { value: '17:00' } })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByText(/Diagnóstico de la Carga de Trabajo/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Regresar/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Jornada Laboral/i)).toBeInTheDocument()
    })
  })

  it('muestra botón "Agregar Función" en el paso 2', async () => {
    declarationService.crearDeclaracion.mockResolvedValue({ id: 10 })
    declarationService.guardarDeclaracion.mockResolvedValue({})

    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/Jornada Laboral/i), { target: { value: 'Tiempo Completo' } })
    fireEvent.change(screen.getByLabelText(/Inicio/i), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText(/Finaliza/i), { target: { value: '17:00' } })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Agregar Función/i })).toBeInTheDocument()
    })
  })

  it('muestra error si se intenta finalizar sin actividades', async () => {
    declarationService.crearDeclaracion.mockResolvedValue({ id: 10 })
    declarationService.guardarDeclaracion.mockResolvedValue({})

    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Número de plaza/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Número de plaza/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/Jornada Laboral/i), { target: { value: 'Tiempo Completo' } })
    fireEvent.change(screen.getByLabelText(/Inicio/i), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText(/Finaliza/i), { target: { value: '17:00' } })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByText(/Diagnóstico de la Carga de Trabajo/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    await waitFor(() => {
      expect(screen.getByText(/Información Adicional/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Finalizar Formulario/i }))

    await waitFor(() => {
      expect(screen.getByText(/Agregue al menos una función/i)).toBeInTheDocument()
    })
  })
})
