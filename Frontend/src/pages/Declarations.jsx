import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import FormButton from '../components/FormButton'
import { obtenerSesion } from '../services/session'
import { obtenerDeclaracionActiva } from '../services/declarationService'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const avisoStyle = {
  maxWidth: '820px',
  margin: '0 auto',
  backgroundColor: COLORS.surfaceMuted,
  borderRadius: '8px',
  padding: '24px',
}

export default function Declarations() {
  const navigate = useNavigate()
  const correo = obtenerSesion()?.correoInstitucional ?? ''
  const [loading, setLoading] = useState(true)
  const [tieneActiva, setTieneActiva] = useState(false)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      if (!correo) return
      setLoading(true)
      try {
        const activa = await obtenerDeclaracionActiva(correo)
        if (activo) setTieneActiva(Boolean(activa?.declaracion))
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

  const continueLabel = tieneActiva ? 'Continuar Declaración' : 'Iniciar Declaración'

  return (
    <PageLayout>
      <h1
        style={{
          fontWeight: 900,
          fontSize: 'clamp(22px, 2.5vw, 34px)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          margin: '0 0 6px',
          color: COLORS.labelColor,
        }}
      >
        Declaración Jurada del Puesto de Trabajo
      </h1>
      <p style={{ textAlign: 'center', color: COLORS.textMuted, margin: '0 0 28px' }}>
        Vicerrectoría de Administración
      </p>

      <div style={avisoStyle}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: COLORS.labelColor, margin: '0 0 12px' }}>
          <span aria-hidden="true">⚠️</span> Aviso Importante
        </h2>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.textDark, margin: '0 0 12px' }}>
          La veracidad y razonabilidad de la información suministrada en este formulario es su responsabilidad.
        </p>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.textDark, margin: '0 0 12px' }}>
          En caso de que el analista observe inconsistencias, se procederá a solicitar una reunión con el
          funcionario y/o con la jefatura inmediata.
        </p>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.textDark, margin: 0 }}>
          Puede guardar su avance y continuar más tarde. Solo puede tener una declaración activa a la vez:
          deberá completarla o cancelarla antes de iniciar otra.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
        <FormButton
          label={loading ? 'Cargando...' : continueLabel}
          type="button"
          variant="primary"
          onClick={() => navigate('/declaraciones/formulario')}
          disabled={loading}
          width="auto"
        />
      </div>
    </PageLayout>
  )
}
