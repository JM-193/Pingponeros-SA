import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import PageLayout from '../components/PageLayout'
import FormButton from '../components/FormButton'
import EntityResultsTable from '../components/EntityResultsTable'
import ReportPreview from '../components/ReportPreview'
import { obtenerSesion } from '../services/session'
import { obtenerDeclaracion } from '../services/declarationService'
import { obtenerReporteHorasDeclaracion } from '../services/reportService'
import { notifyApiError } from '../utils/notify'
import { formatearMinutos } from '../utils/tiempo'
import { COLORS } from '../constants/colors'
import { TIPO_FUNCION } from '../constants/declaracion'

const cardStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  backgroundColor: COLORS.inputBg,
  padding: '32px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: '17px',
  color: COLORS.labelColor,
  margin: '24px 0 12px',
  borderBottom: `1px solid ${COLORS.borderColor}`,
  paddingBottom: '6px',
}

const COLS = [
  { key: 'nombre', label: 'Nombre', render: (r) => r.nombre },
  { key: 'descripcion', label: 'Descripción', render: (r) => r.descripcion },
  { key: 'periodicidad', label: 'Periodicidad', render: (r) => r.periodicidad },
  { key: 'vecesRealizadas', label: 'Cantidad de veces', render: (r) => r.vecesRealizadas, align: 'center' },
  { key: 'duracion', label: 'Duración (min.)', render: (r) => r.duracion, align: 'center' },
]

function Campo({ label, value }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <span style={{ display: 'block', fontWeight: 600, fontSize: '13px', color: COLORS.textSubtle }}>{label}</span>
      <span style={{ fontSize: '15px', color: COLORS.textDark }}>{value || '—'}</span>
    </div>
  )
}

Campo.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
}

function CategoriaTabla({ titulo, actividades }) {
  if (actividades.length === 0) return null
  return (
    <div style={{ marginBottom: '16px' }}>
      <h4 style={{ fontWeight: 700, fontSize: '15px', color: COLORS.labelColor, margin: '0 0 8px' }}>{titulo}</h4>
      <EntityResultsTable columns={COLS} rows={actividades} getRowId={(r) => r.id} />
    </div>
  )
}

CategoriaTabla.propTypes = {
  titulo: PropTypes.string.isRequired,
  actividades: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default function DeclarationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const sesion = obtenerSesion()
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)
  const [reporteBlob, setReporteBlob] = useState(null)
  const [reporteOpen, setReporteOpen] = useState(false)
  const [generandoReporte, setGenerandoReporte] = useState(false)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setLoading(true)
      try {
        const data = await obtenerDeclaracion(id)
        if (activo) setDetalle(data)
      } catch (err) {
        if (activo) notifyApiError(err)
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [id])

  const handleGenerarReporte = async () => {
    setGenerandoReporte(true)
    try {
      const blob = await obtenerReporteHorasDeclaracion(id)
      setReporteBlob(blob)
      setReporteOpen(true)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setGenerandoReporte(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando declaración...</p>
      </PageLayout>
    )
  }

  if (!detalle?.declaracion) {
    return (
      <PageLayout>
        <div style={cardStyle}>
          <p style={{ textAlign: 'center', color: COLORS.textMuted }}>No se encontró la declaración.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <FormButton label="Regresar" type="button" variant="secondary" onClick={() => navigate('/home')} width="auto" />
          </div>
        </div>
      </PageLayout>
    )
  }

  const { declaracion, horario, descanso, horaExtra, permisoAusencia, actividades = [] } = detalle
  const titular = [sesion?.primerNombre, sesion?.segundoNombre, sesion?.primerApellido, sesion?.segundoApellido]
    .filter(Boolean)
    .join(' ')
  const porTipo = (tipo) => actividades.filter((a) => a.tipoFuncion === tipo)

  return (
    <PageLayout>
      <div style={cardStyle}>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px, 2.4vw, 30px)', textAlign: 'center', margin: '0 0 4px', color: COLORS.labelColor }}>
          Declaración Jurada del Puesto de Trabajo
        </h1>
        <p style={{ textAlign: 'center', color: COLORS.textMuted, margin: '0 0 8px' }}>
          Plaza N.º {declaracion.numeroPlaza} · {String(declaracion.fechaDeclaracion).slice(0, 10)}
        </p>

        <h3 style={sectionTitleStyle}>Información General</h3>
        <Campo label="Número de plaza" value={declaracion.numeroPlaza} />
        <Campo label="Cargo del puesto" value={detalle.cargo} />
        <Campo label="Clase Ocupacional" value={detalle.claseOcupacional} />
        <Campo label="Lugar de trabajo" value={detalle.lugarTrabajo} />
        <Campo label="Jornada Laboral" value={horario?.jornadaLaboral} />
        <Campo
          label="Horario Laboral"
          value={horario ? `${horario.horaEntrada} a ${horario.horaSalida}` : '—'}
        />

        <h3 style={sectionTitleStyle}>Diagnóstico de la Carga de Trabajo</h3>
        {actividades.length === 0 ? (
          <p style={{ color: COLORS.textSubtle, fontSize: '14px' }}>Sin funciones declaradas.</p>
        ) : (
          <>
            <CategoriaTabla titulo="Propias de mi puesto" actividades={porTipo(TIPO_FUNCION.PROPIA)} />
            <CategoriaTabla titulo="De otro puesto" actividades={porTipo(TIPO_FUNCION.OTRO)} />
            <CategoriaTabla titulo="De apoyo ocasional" actividades={porTipo(TIPO_FUNCION.APOYO)} />
            <CategoriaTabla titulo="Definida por mí" actividades={porTipo(TIPO_FUNCION.DEFINIDA)} />
          </>
        )}

        <h3 style={sectionTitleStyle}>Información Adicional</h3>
        <Campo label="Tiempo de descanso al día" value={descanso ? formatearMinutos(descanso.tiempo) : '—'} />
        {permisoAusencia && (
          <>
            <Campo label="Permiso o licencia (días por semana)" value={permisoAusencia.dias} />
            <Campo label="Detalle del permiso o licencia" value={permisoAusencia.justificacion} />
            <Campo label="¿De conocimiento de la jefatura?" value={permisoAusencia.conocimientoJefatura === 1 ? 'Sí' : 'No'} />
          </>
        )}
        {horaExtra && (
          <>
            <Campo label="Tiempo adicional (minutos por semana)" value={horaExtra.tiempoAdicional} />
            <Campo label="Justificación del tiempo adicional" value={horaExtra.justificacion} />
            <Campo label="¿De conocimiento de la jefatura?" value={horaExtra.conocimientoJefatura === 1 ? 'Sí' : 'No'} />
          </>
        )}

        <div style={{ borderTop: `1px solid ${COLORS.borderColor}`, paddingTop: '16px', marginTop: '16px' }}>
          <Campo label="Titular del puesto" value={titular} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <FormButton label="Regresar" type="button" variant="secondary" onClick={() => navigate('/home')} width="auto" />
          <FormButton
            label={generandoReporte ? 'Generando...' : 'Reporte de Horas'}
            type="button"
            variant="primary"
            onClick={handleGenerarReporte}
            disabled={generandoReporte}
            width="auto"
          />
        </div>
      </div>

      <ReportPreview
        isOpen={reporteOpen}
        onClose={() => setReporteOpen(false)}
        previewBlob={reporteBlob}
        downloadName={`reporte-horas-declaracion-${id}.pdf`}
        getDownloadBlob={() => reporteBlob}
      />
    </PageLayout>
  )
}
