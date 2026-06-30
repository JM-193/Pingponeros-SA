import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import FormButton from '../components/FormButton'
import { obtenerSesion } from '../services/session'
import { obtenerHistorialDeclaraciones } from '../services/declarationService'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const asArray = (v) => (Array.isArray(v) ? v : [])

export default function Home() {
  const navigate = useNavigate()
  const correo = obtenerSesion()?.correoInstitucional ?? ''
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      if (!correo) return
      setLoading(true)
      try {
        const data = await obtenerHistorialDeclaraciones(correo)
        if (activo) setHistorial(asArray(data))
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
  }, [correo])

  const renderHistorial = () => {
    if (loading) {
      return (
        <p style={{ textAlign: 'center', color: COLORS.textMuted }}>
          Cargando declaraciones...
        </p>
      )
    }

    if (historial.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: COLORS.textMuted, fontStyle: 'italic' }}>
          No hay declaraciones juradas guardadas.
        </p>
      )
    }

    return historial.map((d) => (
      <div
        key={d.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: COLORS.white,
          borderRadius: '6px',
          padding: '12px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '14px',
              color: COLORS.textDark,
            }}
          >
            Plaza N.º {d.numeroPlaza}
            {d.cargo ? ` — ${d.cargo}` : ''}
          </p>

          <p
            style={{
              margin: '2px 0 0',
              fontSize: '13px',
              color: COLORS.textMuted,
            }}
          >
            {String(d.fechaDeclaracion).slice(0, 10)}
          </p>
        </div>

        <FormButton
          label="Ver"
          type="button"
          variant="primary"
          onClick={() => navigate(`/declaraciones/ver/${d.id}`)}
          width="auto"
        />
      </div>
    ))
  }

  return (
    <PageLayout>
      <h1
        style={{
          fontWeight: 900,
          fontSize: 'clamp(22px, 2.5vw, 34px)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          margin: '0 0 10px',
          color: COLORS.labelColor,
        }}
      >
        Vicerrectoría de Administración
      </h1>

      <h2
        style={{
          fontWeight: 800,
          fontSize: 'clamp(14px, 1.8vw, 22px)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          margin: '0 0 28px',
          color: COLORS.labelColor,
        }}
      >
        Aplicación de Cargas de Trabajo
      </h2>

      <p
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          textAlign: 'justify',
          maxWidth: '820px',
          margin: '0 auto 36px',
          color: COLORS.textDark,
        }}
      >
        La herramienta para la aplicación de cargas de trabajo, tiene por objetivo recopilar
        información que permita conocer el volumen, distribución y organización del trabajo.
        Sus respuestas verdaderas y precisas servirán de referencia para valorar las necesidades
        planteadas por su Unidad de Trabajo. Las respuestas brindadas serán contrastadas con
        la matriz de procesos de la Unidad respectiva, así como los formularios generales de
        puesto. Se agradece el tiempo y disposición para analizar y responder las preguntas
        que se le indican.
      </p>

      {/* Sección de declaraciones */}
      <h3
        style={{
          fontWeight: 700,
          fontSize: 'clamp(15px, 1.5vw, 20px)',
          textAlign: 'center',
          margin: '0 0 16px',
          color: COLORS.labelColor,
        }}
      >
        Declaraciones Jurada del Puesto de Trabajo
      </h3>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <FormButton
          label="Ir a Declaraciones"
          type="button"
          variant="primary"
          onClick={() => navigate('/declaraciones')}
          width="auto"
        />
      </div>

      {/* Historial box */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          backgroundColor: COLORS.surfacePanel,
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h4
          style={{
            fontWeight: 700,
            fontSize: '15px',
            textAlign: 'center',
            margin: '0 0 18px',
            color: COLORS.labelColor,
          }}
        >
          Historial de Declaraciones Juradas
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {renderHistorial()}
        </div>
      </div>
    </PageLayout>
  )
}
