// DeclarationView.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DeclarationView from '../pages/DeclarationView'
import * as session from '../services/session'
import * as declarationService from '../services/declarationService'

vi.mock('../services/session')
vi.mock('../services/declarationService')

const mockSesion = {
  primerNombre: 'Juan',
  segundoNombre: 'Carlos',
  primerApellido: 'Pérez',
  segundoApellido: 'García',
  correoInstitucional: 'juan@ucr.ac.cr',
}

const mockDetalle = {
  declaracion: {
    id: 1,
    numeroPlaza: 100,
    fechaDeclaracion: '2025-06-01T00:00:00',
    completa: 1,
  },
  cargo: 'Analista de Sistemas',
  claseOcupacional: 'Profesional',
  lugarTrabajo: 'Edificio Central',
  horario: {
    horaEntrada: '08:00',
    horaSalida: '17:00',
    jornadaLaboral: 'Tiempo Completo',
  },
  descanso: { tiempo: 60 },
  horaExtra: null,
  permisoAusencia: null,
  actividades: [
    {
      id: 10,
      tipoFuncion: 'Propia de mi puesto',
      nombre: 'Elaborar informes',
      descripcion: 'Redactar informes mensuales',
      periodicidad: 'Mensual',
      vecesRealizadas: 1,
      duracion: 120,
    },
  ],
}

function renderConId(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/declaraciones/${id}`]}>
      <Routes>
        <Route path="/declaraciones/:id" element={<DeclarationView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DeclarationView Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue(mockSesion)
  })

  it('muestra estado de carga inicial', () => {
    declarationService.obtenerDeclaracion.mockImplementation(() => new Promise(() => {}))

    renderConId()

    expect(screen.getByText(/Cargando declaración/i)).toBeInTheDocument()
  })

  it('muestra mensaje cuando no se encuentra la declaración', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(null)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/No se encontró la declaración/i)).toBeInTheDocument()
    })
  })

  it('renderiza el número de plaza cuando carga datos', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/Plaza N\.º/i)).toBeInTheDocument()
    })
  })

  it('renderiza el cargo del puesto', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText('Analista de Sistemas')).toBeInTheDocument()
    })
  })

  it('renderiza la jornada laboral', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText('Tiempo Completo')).toBeInTheDocument()
    })
  })

  it('renderiza el horario de entrada y salida', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/08:00 a 17:00/i)).toBeInTheDocument()
    })
  })

  it('renderiza las actividades en la tabla', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
      expect(screen.getByText('Redactar informes mensuales')).toBeInTheDocument()
    })
  })

  it('renderiza el nombre del titular', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/Juan Carlos Pérez García/i)).toBeInTheDocument()
    })
  })

  it('renderiza el botón Regresar cuando hay datos', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Regresar/i })).toBeInTheDocument()
    })
  })

  it('llama a obtenerDeclaracion con el id de la URL', () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId('42')

    expect(declarationService.obtenerDeclaracion).toHaveBeenCalledWith('42')
  })

  it('muestra horaExtra cuando está presente', async () => {
    const conHoraExtra = {
      ...mockDetalle,
      horaExtra: {
        tiempoAdicional: 30,
        justificacion: 'Reuniones fuera de horario',
        conocimientoJefatura: 1,
      },
    }
    declarationService.obtenerDeclaracion.mockResolvedValue(conHoraExtra)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText('Reuniones fuera de horario')).toBeInTheDocument()
    })
  })

  it('muestra permiso de ausencia cuando está presente', async () => {
    const conPermiso = {
      ...mockDetalle,
      permisoAusencia: {
        dias: 2,
        justificacion: 'Permiso médico',
        conocimientoJefatura: 1,
      },
    }
    declarationService.obtenerDeclaracion.mockResolvedValue(conPermiso)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText('Permiso médico')).toBeInTheDocument()
    })
  })

  it('muestra "Sin funciones declaradas" cuando no hay actividades', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue({ ...mockDetalle, actividades: [] })

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/Sin funciones declaradas/i)).toBeInTheDocument()
    })
  })

  it('renderiza sección de Información General', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/Información General/i)).toBeInTheDocument()
    })
  })

  it('renderiza sección de Diagnóstico de la Carga de Trabajo', async () => {
    declarationService.obtenerDeclaracion.mockResolvedValue(mockDetalle)

    renderConId()

    await waitFor(() => {
      expect(screen.getByText(/Diagnóstico de la Carga de Trabajo/i)).toBeInTheDocument()
    })
  })
})
