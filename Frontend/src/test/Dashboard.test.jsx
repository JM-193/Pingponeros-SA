// Dashboard.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import { obtenerResumenDashboard } from '../services/dashboardService'

// El servicio se mockea para controlar la carga de datos del panel.
vi.mock('../services/dashboardService', () => ({
  obtenerResumenDashboard: vi.fn(),
}))

// recharts usa ResizeObserver (no disponible en jsdom); se sustituye cada componente por un
// contenedor simple que solo renderiza a sus hijos.
vi.mock('recharts', () => {
  const Passthrough = () => <div />
  return {
    ResponsiveContainer: Passthrough,
    BarChart: Passthrough,
    Bar: Passthrough,
    XAxis: Passthrough,
    YAxis: Passthrough,
    CartesianGrid: Passthrough,
    Tooltip: Passthrough,
    PieChart: Passthrough,
    Pie: Passthrough,
    Legend: Passthrough,
    LineChart: Passthrough,
    Line: Passthrough,
  }
})

const RESUMEN = {
  indicadores: {
    totalUsuarios: 12,
    usuariosActivos: 9,
    totalPlazas: 20,
    plazasAsignadas: 14,
    plazasDisponibles: 6,
    declaracionesCompletadas: 7,
    declaracionesPendientes: 3,
  },
  alertas: {
    declaracionesPendientes: 3,
    contrasenasPorExpirar: 1,
    usuariosInactivos: 2,
    plazasSinAsignar: 6,
  },
  usuariosPorRol: { administradores: 2, usuarios: 10 },
  estadoDeclaraciones: { completadas: 7, pendientes: 3 },
  plazasPorArea: [{ etiqueta: 'TI', cantidad: 8 }],
  asignacionesPorPeriodo: [{ etiqueta: '2026-06', cantidad: 4 }],
  ultimasPlazasAsignadas: [
    { numeroPlaza: 101, usuario: 'Juan Pérez', puesto: 'Analista', fechaInicio: '2026-06-01T00:00:00' },
  ],
  declaracionesRecientes: [
    { id: 1, usuario: 'Ana Mora', numeroPlaza: 102, fechaDeclaracion: '2026-06-15T00:00:00', completa: 1 },
  ],
}

const renderDashboard = () =>
  render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>,
  )

describe('Dashboard Page', () => {
  beforeEach(() => {
    obtenerResumenDashboard.mockReset()
  })

  it('muestra el estado de carga inicialmente', () => {
    obtenerResumenDashboard.mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.getByText(/Cargando información del panel/i)).toBeInTheDocument()
  })

  it('renderiza los indicadores cuando los datos cargan', async () => {
    obtenerResumenDashboard.mockResolvedValue(RESUMEN)
    renderDashboard()

    expect(await screen.findByText('Panel de Control')).toBeInTheDocument()
    expect(screen.getByText('Usuarios registrados')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Plazas disponibles')).toBeInTheDocument()
  })

  it('renderiza las alertas activas y oculta las que están en cero', async () => {
    obtenerResumenDashboard.mockResolvedValue(RESUMEN)
    renderDashboard()

    expect(await screen.findByText('Contraseñas próximas a expirar')).toBeInTheDocument()
    expect(screen.getByText('Usuarios inactivos')).toBeInTheDocument()
  })

  it('renderiza las tablas de actividad reciente', async () => {
    obtenerResumenDashboard.mockResolvedValue(RESUMEN)
    renderDashboard()

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Ana Mora')).toBeInTheDocument()
    expect(screen.getByText('Últimas plazas asignadas')).toBeInTheDocument()
  })

  it('renderiza los accesos rápidos', async () => {
    obtenerResumenDashboard.mockResolvedValue(RESUMEN)
    renderDashboard()

    expect(await screen.findByText('Accesos rápidos')).toBeInTheDocument()
    expect(screen.getByText('Reportes')).toBeInTheDocument()
  })

  it('muestra un mensaje de error cuando la carga falla', async () => {
    obtenerResumenDashboard.mockRejectedValue(new Error('fallo'))
    renderDashboard()

    expect(
      await screen.findByText(/No se pudo cargar el panel/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })
})
