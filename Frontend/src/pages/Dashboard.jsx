import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiGrid,
  FiCheckSquare,
  FiInbox,
  FiCheckCircle,
  FiClock,
  FiKey,
  FiBriefcase,
  FiFileText,
  FiUser,
  FiBarChart2,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import PageLayout from '../components/PageLayout'
import StatCard from '../components/StatCard'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { obtenerResumenDashboard } from '../services/dashboardService'
import { obtenerSesion } from '../services/session'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

// Paleta de acento del panel (deriva de COLORS y añade tonos de estado).
const ACCENT = {
  primary: COLORS.primaryBtn,
  info: COLORS.headerBg,
  indigo: COLORS.navBg,
  teal: '#0e7c86',
  success: '#2e7d32',
  warn: '#e08a00',
  danger: COLORS.danger,
  neutral: COLORS.textSubtle,
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const ACCESOS = [
  { label: 'Usuarios', icon: <FiUsers size={22} />, path: '/usuarios/consultar' },
  { label: 'Plazas', icon: <FiBriefcase size={22} />, path: '/plazas/consultar' },
  { label: 'Declaraciones', icon: <FiFileText size={22} />, path: '/declaraciones' },
  { label: 'Perfil', icon: <FiUser size={22} />, path: '/perfil' },
  { label: 'Reportes', icon: <FiBarChart2 size={22} />, path: '/reportes' },
]

const fechaCorta = (valor) => (valor ? String(valor).slice(0, 10) : '—')

const formatPeriodo = (etiqueta) => {
  const [anio, mes] = String(etiqueta).split('-')
  const indice = Number(mes) - 1
  if (Number.isNaN(indice) || indice < 0 || indice > 11) return etiqueta
  return `${MESES[indice]} ${String(anio).slice(2)}`
}

const sumar = (lista, clave) =>
  (Array.isArray(lista) ? lista : []).reduce((total, item) => total + (Number(item?.[clave]) || 0), 0)

// ---------------------------------------------------------------- //
// Subcomponentes presentacionales                                  //
// ---------------------------------------------------------------- //
function SectionCard({ title, children, action }) {
  return (
    <section
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: COLORS.labelColor }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  action: PropTypes.node,
}

function EmptyChart({ text }) {
  return (
    <div
      style={{
        height: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.textLight,
        fontStyle: 'italic',
        fontSize: '14px',
      }}
    >
      {text}
    </div>
  )
}

EmptyChart.propTypes = { text: PropTypes.string.isRequired }

function AlertBanner({ icon, label, count, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '10px',
        backgroundColor: `${color}14`,
        border: `1px solid ${color}55`,
      }}
    >
      <span style={{ color, display: 'flex', flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '18px', color: COLORS.textDark }}>
          {count}
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: COLORS.textMuted }}>{label}</p>
      </div>
    </div>
  )
}

AlertBanner.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
}

function DataTable({ columns, rows, emptyText }) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (!rows || rows.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: COLORS.textLight, fontStyle: 'italic', margin: '24px 0' }}>
        {emptyText}
      </p>
    )
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rows.map((row, indice) => (
          <div
            key={row._key ?? indice}
            style={{
              backgroundColor: COLORS.inputBg,
              borderRadius: '8px',
              padding: '12px 14px',
              border: `1px solid ${COLORS.borderSubtle}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            }}
          >
            {columns.map((col, i) => (
              <div
                key={col.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '6px 0',
                  borderBottom: i < columns.length - 1 ? `1px solid ${COLORS.borderSubtle}` : 'none',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '12px',
                    color: COLORS.textMuted,
                    flexShrink: 0,
                    minWidth: '80px',
                  }}
                >
                  {col.header}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: COLORS.textDark,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderBottom: `2px solid ${COLORS.borderSubtle}`,
                  color: COLORS.textMuted,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, indice) => (
            <tr key={row._key ?? indice}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '8px 10px',
                    borderBottom: `1px solid ${COLORS.borderSubtle}`,
                    color: COLORS.textDark,
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.array,
  emptyText: PropTypes.string.isRequired,
}

function EstadoBadge({ completa }) {
  const activa = completa === 1
  const color = activa ? ACCENT.success : ACCENT.warn
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        color,
        backgroundColor: `${color}1a`,
        whiteSpace: 'nowrap',
      }}
    >
      {activa ? 'Completa' : 'En progreso'}
    </span>
  )
}

EstadoBadge.propTypes = { completa: PropTypes.number }

// ---------------------------------------------------------------- //
// Página                                                           //
// ---------------------------------------------------------------- //
export default function Dashboard() {
  const navigate = useNavigate()
  const sesion = obtenerSesion()
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setLoading(true)
      setError(false)
      try {
        const data = await obtenerResumenDashboard()
        if (activo) setResumen(data)
      } catch (err) {
        if (activo) {
          setError(true)
          notifyApiError(err)
        }
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [])

  const recargar = () => {
    // Cambia el contador para re-disparar el efecto sin recargar la página.
    setResumen(null)
    setLoading(true)
    setError(false)
    obtenerResumenDashboard()
      .then((data) => setResumen(data))
      .catch((err) => {
        setError(true)
        notifyApiError(err)
      })
      .finally(() => setLoading(false))
  }

  return (
    <PageLayout>
      <Encabezado nombre={sesion?.primerNombre} onRefresh={recargar} loading={loading} />

      {loading && <Estado mensaje="Cargando información del panel..." />}

      {!loading && error && (
        <Estado
          mensaje="No se pudo cargar el panel. Intente nuevamente."
          accion={
            <button type="button" onClick={recargar} style={botonReintentarStyle}>
              <FiRefreshCw size={16} /> Reintentar
            </button>
          }
        />
      )}

      {!loading && !error && resumen && (
        <Contenido resumen={resumen} navigate={navigate} />
      )}
    </PageLayout>
  )
}

function Encabezado({ nombre, onRefresh, loading }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      <div>
        <h1
          style={{
            fontWeight: 900,
            fontSize: 'clamp(22px, 2.5vw, 32px)',
            letterSpacing: '0.02em',
            margin: 0,
            color: COLORS.labelColor,
          }}
        >
          Panel de Control
        </h1>
        <p style={{ margin: '4px 0 0', color: COLORS.textMuted, fontSize: '14px' }}>
          {nombre ? `Bienvenido, ${nombre}. ` : ''}
          Vista general del estado del sistema.
        </p>
      </div>
      <button type="button" onClick={onRefresh} disabled={loading} style={botonReintentarStyle}>
        <FiRefreshCw size={16} /> Actualizar
      </button>
    </div>
  )
}

Encabezado.propTypes = {
  nombre: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

function Estado({ mensaje, accion }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        padding: '60px 20px',
        color: COLORS.textMuted,
      }}
    >
      <p style={{ margin: 0, fontSize: '15px' }}>{mensaje}</p>
      {accion}
    </div>
  )
}

Estado.propTypes = {
  mensaje: PropTypes.string.isRequired,
  accion: PropTypes.node,
}

function Contenido({ resumen, navigate }) {
  const {
    indicadores = {},
    alertas = {},
    usuariosPorRol = {},
    estadoDeclaraciones = {},
    plazasPorArea = [],
    asignacionesPorPeriodo = [],
    ultimasPlazasAsignadas = [],
    declaracionesRecientes = [],
  } = resumen

  const tarjetas = [
    { label: 'Usuarios registrados', value: indicadores.totalUsuarios ?? 0, icon: <FiUsers size={22} />, accent: ACCENT.primary },
    { label: 'Usuarios activos', value: indicadores.usuariosActivos ?? 0, icon: <FiUserCheck size={22} />, accent: ACCENT.success },
    { label: 'Plazas registradas', value: indicadores.totalPlazas ?? 0, icon: <FiGrid size={22} />, accent: ACCENT.indigo },
    { label: 'Plazas asignadas', value: indicadores.plazasAsignadas ?? 0, icon: <FiCheckSquare size={22} />, accent: ACCENT.info },
    { label: 'Plazas disponibles', value: indicadores.plazasDisponibles ?? 0, icon: <FiInbox size={22} />, accent: ACCENT.teal },
    { label: 'Declaraciones completadas', value: indicadores.declaracionesCompletadas ?? 0, icon: <FiCheckCircle size={22} />, accent: ACCENT.success },
    { label: 'Declaraciones en progreso', value: indicadores.declaracionesPendientes ?? 0, icon: <FiClock size={22} />, accent: ACCENT.warn },
  ]

  const alertasConfig = [
    { key: 'declaracionesPendientes', label: 'Declaraciones en progreso', icon: <FiFileText size={22} />, color: ACCENT.warn },
    { key: 'contrasenasPorExpirar', label: 'Contraseñas próximas a expirar', icon: <FiKey size={22} />, color: ACCENT.danger },
    { key: 'usuariosInactivos', label: 'Usuarios inactivos', icon: <FiUserX size={22} />, color: ACCENT.neutral },
    { key: 'plazasSinAsignar', label: 'Plazas sin asignar', icon: <FiGrid size={22} />, color: ACCENT.primary },
  ]
  const alertasActivas = alertasConfig.filter((a) => (alertas[a.key] ?? 0) > 0)

  const rolData = [
    { name: 'Administradores', value: usuariosPorRol.administradores ?? 0 },
    { name: 'Funcionarios', value: usuariosPorRol.usuarios ?? 0 },
  ]
  const declData = [
    { name: 'Completadas', value: estadoDeclaraciones.completadas ?? 0 },
    { name: 'En progreso', value: estadoDeclaraciones.pendientes ?? 0 },
  ]
  const periodoData = (asignacionesPorPeriodo ?? []).map((p) => ({
    mes: formatPeriodo(p.etiqueta),
    cantidad: p.cantidad,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Indicadores */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {tarjetas.map((t) => (
          <StatCard key={t.label} label={t.label} value={t.value} icon={t.icon} accent={t.accent} />
        ))}
      </div>

      {/* Alertas */}
      <SectionCard title="Alertas">
        {alertasActivas.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: ACCENT.success }}>
            <FiCheckCircle size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Todo en orden: no hay alertas activas.
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '14px',
            }}
          >
            {alertasActivas.map((a) => (
              <AlertBanner key={a.key} icon={a.icon} label={a.label} count={alertas[a.key] ?? 0} color={a.color} />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Gráficos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <SectionCard title="Distribución de plazas por área">
          {sumar(plazasPorArea, 'cantidad') === 0 ? (
            <EmptyChart text="No hay plazas registradas." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={plazasPorArea} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderSubtle} />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Plazas" fill={ACCENT.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Asignaciones por período (últimos 12 meses)">
          {sumar(periodoData, 'cantidad') === 0 ? (
            <EmptyChart text="No hay asignaciones en el período." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={periodoData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderSubtle} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  name="Asignaciones"
                  stroke={ACCENT.primary}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Distribución de usuarios por rol">
          {sumar(rolData, 'value') === 0 ? (
            <EmptyChart text="No hay usuarios registrados." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={rolData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  <Cell fill={ACCENT.primary} />
                  <Cell fill={ACCENT.info} />
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Estado de declaraciones juradas">
          {sumar(declData, 'value') === 0 ? (
            <EmptyChart text="No hay declaraciones registradas." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={declData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  <Cell fill={ACCENT.success} />
                  <Cell fill={ACCENT.warn} />
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Tablas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <SectionCard title="Últimas plazas asignadas">
          <DataTable
            emptyText="No hay plazas asignadas recientes."
            rows={ultimasPlazasAsignadas.map((p, i) => ({ ...p, _key: `${p.numeroPlaza}-${i}` }))}
            columns={[
              { key: 'numeroPlaza', header: 'N.º Plaza', render: (r) => `N.º ${r.numeroPlaza}` },
              { key: 'usuario', header: 'Usuario' },
              { key: 'puesto', header: 'Puesto' },
              { key: 'fechaInicio', header: 'Fecha inicio', render: (r) => fechaCorta(r.fechaInicio) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Declaraciones recientes">
          <DataTable
            emptyText="No hay declaraciones recientes."
            rows={declaracionesRecientes.map((d) => ({ ...d, _key: d.id }))}
            columns={[
              { key: 'usuario', header: 'Usuario' },
              { key: 'numeroPlaza', header: 'Plaza', render: (r) => `N.º ${r.numeroPlaza}` },
              { key: 'fechaDeclaracion', header: 'Fecha', render: (r) => fechaCorta(r.fechaDeclaracion) },
              { key: 'completa', header: 'Estado', render: (r) => <EstadoBadge completa={r.completa} /> },
            ]}
          />
        </SectionCard>
      </div>

      {/* Accesos rápidos */}
      <SectionCard title="Accesos rápidos">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '14px',
          }}
        >
          {ACCESOS.map((acceso) => (
            <button
              key={acceso.path}
              type="button"
              onClick={() => navigate(acceso.path)}
              style={accesoBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.surfaceHover
                e.currentTarget.style.borderColor = COLORS.primaryBtn
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white
                e.currentTarget.style.borderColor = COLORS.borderSubtle
              }}
            >
              <span style={{ color: COLORS.primaryBtn, display: 'flex' }}>{acceso.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.textDark }}>
                {acceso.label}
              </span>
              <FiArrowRight size={14} style={{ color: COLORS.textLight, marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

Contenido.propTypes = {
  resumen: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
}

const botonReintentarStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '6px',
  border: `1px solid ${COLORS.borderLight}`,
  backgroundColor: COLORS.white,
  color: COLORS.primaryBtn,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}

const accesoBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 16px',
  borderRadius: '10px',
  border: `1px solid ${COLORS.borderSubtle}`,
  backgroundColor: COLORS.white,
  cursor: 'pointer',
  transition: 'background-color 0.15s, border-color 0.15s',
}
