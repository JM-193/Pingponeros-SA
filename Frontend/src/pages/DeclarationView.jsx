import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import PageLayout from '../components/PageLayout'
import FormButton from '../components/FormButton'
import EntityResultsTable from '../components/EntityResultsTable'
import ReportPreview from '../components/ReportPreview'
import { obtenerSesion } from '../services/session'
import { obtenerDeclaracion } from '../services/declarationService'
import { obtenerReporteHorasDeclaracion, obtenerDeclaracionDocumento } from '../services/reportService'
import { notifyApiError } from '../utils/notify'
import { formatearMinutos } from '../utils/tiempo'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { COLORS } from '../constants/colors'
import { TIPO_FUNCION } from '../constants/declaracion'

// El documento imita una hoja oficial (proporción cercana a A4) para que la vista en pantalla y el
// PDF que se imprime para la firma física se vean homogéneos.
const paperStyle = {
  maxWidth: '820px',
  margin: '0 auto',
  backgroundColor: COLORS.white,
  padding: 'clamp(24px, 5vw, 56px)',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
  border: `1px solid ${COLORS.borderColor}`,
}

const subtituloStyle = {
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontSize: '12px',
  fontWeight: 700,
  color: COLORS.textLabel,
  margin: '0 0 6px',
}

const tituloStyle = {
  fontWeight: 900,
  fontSize: 'clamp(20px, 2.5vw, 30px)',
  textAlign: 'center',
  lineHeight: 1.2,
  margin: '0 0 8px',
  color: COLORS.labelColor,
}

const metaStyle = {
  textAlign: 'center',
  color: COLORS.textMuted,
  fontSize: '14px',
  margin: 0,
}

const reglaEncabezado = {
  border: 'none',
  borderTop: `2px solid ${COLORS.navBg}`,
  margin: '18px 0 4px',
}

const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: '15px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: COLORS.labelColor,
  margin: '28px 0 14px',
  borderBottom: `1px solid ${COLORS.borderColor}`,
  paddingBottom: '6px',
}

const etiquetaStyle = {
  display: 'block',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: COLORS.textLabel,
  marginBottom: '2px',
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
      <span style={etiquetaStyle}>{label}</span>
      <span style={{ fontSize: '15px', color: COLORS.textDark, wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

Campo.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
}

// Rejilla de dos columnas para los campos del documento; colapsa a una sola columna en móvil.
function CamposGrid({ children, columnas }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: columnas === 1 ? '1fr' : '1fr 1fr',
        columnGap: '32px',
      }}
    >
      {children}
    </div>
  )
}

CamposGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columnas: PropTypes.oneOf([1, 2]).isRequired,
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

// Línea de firma física con su etiqueta debajo, dejando espacio en blanco para firmar.
function LineaFirma({ valor, etiqueta }) {
  return (
    <div style={{ flex: '1 1 220px' }}>
      <div style={{ height: '40px' }} />
      <div style={{ borderTop: `1px solid ${COLORS.textDark}`, paddingTop: '6px' }}>
        {valor && (
          <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: COLORS.textDark }}>{valor}</span>
        )}
        <span style={etiquetaStyle}>{etiqueta}</span>
      </div>
    </div>
  )
}

LineaFirma.propTypes = {
  valor: PropTypes.node,
  etiqueta: PropTypes.string.isRequired,
}

export default function DeclarationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const sesion = obtenerSesion()
  const esMovil = useMediaQuery('(max-width: 640px)')
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)
  const [previewBlob, setPreviewBlob] = useState(null)
  const [previewName, setPreviewName] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [generando, setGenerando] = useState(null) // 'horas' | 'documento' | null

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

  // Genera el PDF pedido (reporte de horas o documento de la declaración) y lo abre en el visor común.
  const abrirPreview = async (tipo) => {
    setGenerando(tipo)
    try {
      const esHoras = tipo === 'horas'
      const blob = esHoras
        ? await obtenerReporteHorasDeclaracion(id)
        : await obtenerDeclaracionDocumento(id)
      setPreviewBlob(blob)
      setPreviewName(esHoras ? `reporte-horas-declaracion-${id}.pdf` : `declaracion-jurada-${id}.pdf`)
      setPreviewOpen(true)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setGenerando(null)
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
        <div style={paperStyle}>
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
  const columnas = esMovil ? 1 : 2

  return (
    <PageLayout>
      <div style={paperStyle}>
        <p style={subtituloStyle}>Vicerrectoría de Administración</p>
        <h1 style={tituloStyle}>Declaración Jurada del Puesto de Trabajo</h1>
        <hr style={reglaEncabezado} />
        <p style={metaStyle}>
          Plaza N.º {declaracion.numeroPlaza} · {String(declaracion.fechaDeclaracion).slice(0, 10)}
        </p>

        <h3 style={sectionTitleStyle}>Información General</h3>
        <CamposGrid columnas={columnas}>
          <Campo label="Número de plaza" value={declaracion.numeroPlaza} />
          <Campo label="Cargo del puesto" value={detalle.cargo} />
          <Campo label="Clase Ocupacional" value={detalle.claseOcupacional} />
          <Campo label="Lugar de trabajo" value={detalle.lugarTrabajo} />
          <Campo label="Jornada Laboral" value={horario?.jornadaLaboral} />
          <Campo
            label="Horario Laboral"
            value={horario ? `${horario.horaEntrada} a ${horario.horaSalida}` : '—'}
          />
        </CamposGrid>

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
        <CamposGrid columnas={columnas}>
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
        </CamposGrid>

        <div style={{ borderTop: `1px solid ${COLORS.borderColor}`, marginTop: '32px', paddingTop: '24px' }}>
          <p style={{ fontStyle: 'italic', fontSize: '13px', color: COLORS.textMuted, lineHeight: 1.6, margin: '0 0 8px' }}>
            Declaro bajo juramento que la información consignada en este documento es verídica y completa.
          </p>
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <LineaFirma
              valor={
                <>
                  {titular} <span style={{ ...etiquetaStyle, display: 'inline' }}>(Firma)</span>
                </>
              }
              etiqueta="Titular del puesto"
            />
            <LineaFirma etiqueta="Fecha en que se firmó" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
        <FormButton label="Regresar" type="button" variant="secondary" onClick={() => navigate('/home')} width="auto" />
        <FormButton
          label={generando === 'horas' ? 'Generando...' : 'Reporte de Horas'}
          type="button"
          variant="outline"
          onClick={() => abrirPreview('horas')}
          disabled={generando !== null}
          width="auto"
        />
        <FormButton
          label={generando === 'documento' ? 'Generando...' : 'Imprimir Declaración'}
          type="button"
          variant="primary"
          onClick={() => abrirPreview('documento')}
          disabled={generando !== null}
          width="auto"
        />
      </div>

      <ReportPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        previewBlob={previewBlob}
        downloadName={previewName}
        getDownloadBlob={() => previewBlob}
      />
    </PageLayout>
  )
}
