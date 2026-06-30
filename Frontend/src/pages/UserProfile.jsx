import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'
import EntityResultsTable from '../components/EntityResultsTable'
import { obtenerSesion } from '../services/session'
import { obtenerPlazasUsuario } from '../services/userService'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const asArray = (v) => (Array.isArray(v) ? v : [])

const formatFecha = (value) => (value ? String(value).slice(0, 10) : '—')

const COLUMNS = [
  { key: 'numeroPlaza', label: 'N.º Plaza', render: (r) => r.numeroPlaza },
  { key: 'puestoNombre', label: 'Puesto de Trabajo', render: (r) => r.puestoNombre ?? r.idPuesto },
  { key: 'claseOcupacionalNombre', label: 'Clase Ocupacional', render: (r) => r.claseOcupacionalNombre },
  { key: 'lugarTrabajo', label: 'Lugar de Trabajo', render: (r) => r.lugarTrabajo },
  { key: 'fechaInicio', label: 'Fecha Inicial', render: (r) => formatFecha(r.fechaInicio) },
  { key: 'fechaFinal', label: 'Fecha Final', render: (r) => formatFecha(r.fechaFinal) },
]

export default function UserProfile() {
  const sesion = obtenerSesion()
  const correo = sesion?.correoInstitucional ?? ''
  const [plazas, setPlazas] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const nombreCompleto = [
    sesion?.primerNombre,
    sesion?.segundoNombre,
    sesion?.primerApellido,
    sesion?.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      if (!correo) return
      setLoading(true)
      setLoadError(null)
      try {
        const data = await obtenerPlazasUsuario(correo)
        if (activo) setPlazas(asArray(data))
      } catch (err) {
        if (activo) {
          setLoadError('No fue posible cargar las plazas. Intente de nuevo más tarde.')
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
  }, [correo])

  const renderPlazas = () => {
    if (loading) {
      return (
        <p style={{ textAlign: 'center', color: COLORS.textMuted }}>Cargando plazas...</p>
      )
    }

    if (loadError) {
      return (
        <p
          style={{
            textAlign: 'center',
            color: COLORS.danger,
            backgroundColor: COLORS.errorSoftBg,
            border: `1px solid ${COLORS.errorSoftBorder}`,
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          {loadError}
        </p>
      )
    }

    if (plazas.length === 0) {
      return (
        <p
          style={{
            textAlign: 'center',
            color: COLORS.textSubtle,
            fontStyle: 'italic',
            backgroundColor: COLORS.surfaceAlt,
            border: `1px solid ${COLORS.borderColor}`,
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          No tiene plazas asignadas.
        </p>
      )
    }

    return (
      <EntityResultsTable
        columns={COLUMNS}
        rows={plazas}
        getRowId={(plaza) => plaza.numeroPlaza}
      />
    )
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
          margin: '0 0 32px',
          color: COLORS.labelColor,
        }}
      >
        Mi Perfil
      </h1>

      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto 32px',
          backgroundColor: COLORS.surfacePanel,
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: '16px',
            color: COLORS.labelColor,
            margin: '0 0 20px',
          }}
        >
          Información Personal
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '12px',
                color: COLORS.textMuted,
                marginBottom: '4px',
              }}
            >
              Nombre completo
            </span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: COLORS.textDark }}>
              {nombreCompleto || '—'}
            </span>
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '12px',
                color: COLORS.textMuted,
                marginBottom: '4px',
              }}
            >
              Correo institucional
            </span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: COLORS.textDark }}>
              {correo || '—'}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          backgroundColor: COLORS.surfacePanel,
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: '16px',
            color: COLORS.labelColor,
            margin: '0 0 16px',
          }}
        >
          Plazas Asignadas
        </h2>
        {renderPlazas()}
      </div>
    </PageLayout>
  )
}
