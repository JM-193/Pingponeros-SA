import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  obtenerPlazasUsuario,
  asignarPlazaUsuario,
  desasignarPlazaUsuario,
} from '../services/userService'
import { obtenerPlazasDisponibles } from '../services/positionService'
import { obtenerPuestos } from '../services/workPositionService'
import EntityResultsTable from './EntityResultsTable'
import FormSelect from './FormSelect'
import FormInput from './FormInput'
import FormButton from './FormButton'
import { confirmDelete } from '../utils/alerts'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const EMPTY_FORM = {
  numeroPlaza: '',
  idPuesto: '',
  claseOcupacional: '',
  fechaInicio: '',
  fechaFinal: '',
}

const asArray = (value) => (Array.isArray(value) ? value : [])

// Las fechas llegan como ISO (p. ej. "2026-06-25T00:00:00"); se muestra solo la parte de fecha.
const formatFecha = (value) => (value ? String(value).slice(0, 10) : '')

export default function UserPositionsSection({ correo }) {
  const [assignments, setAssignments] = useState([])
  const [availablePlazas, setAvailablePlazas] = useState([])
  const [puestos, setPuestos] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingPlaza, setDeletingPlaza] = useState(null)

  const refrescar = useCallback(async () => {
    const [asignadas, disponibles] = await Promise.all([
      obtenerPlazasUsuario(correo),
      obtenerPlazasDisponibles(),
    ])
    setAssignments(asArray(asignadas))
    setAvailablePlazas(asArray(disponibles))
  }, [correo])

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setIsLoading(true)
      try {
        const [asignadas, disponibles, listaPuestos] = await Promise.all([
          obtenerPlazasUsuario(correo),
          obtenerPlazasDisponibles(),
          obtenerPuestos(),
        ])
        if (!activo) return
        setAssignments(asArray(asignadas))
        setAvailablePlazas(asArray(disponibles))
        setPuestos(asArray(listaPuestos))
      } catch (err) {
        if (activo) notifyApiError(err)
      } finally {
        if (activo) setIsLoading(false)
      }
    }
    if (correo) cargar()
    return () => {
      activo = false
    }
  }, [correo])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const next = {}
    if (!form.numeroPlaza) next.numeroPlaza = 'Seleccione una plaza'
    if (!form.idPuesto) next.idPuesto = 'Seleccione un puesto'
    if (!form.claseOcupacional.trim()) next.claseOcupacional = 'La clase ocupacional es obligatoria'
    if (!form.fechaInicio) next.fechaInicio = 'La fecha de inicio es obligatoria'
    if (form.fechaFinal && form.fechaInicio && form.fechaFinal < form.fechaInicio) {
      next.fechaFinal = 'La fecha final no puede ser anterior a la de inicio'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleAgregar = async () => {
    if (!validar()) return

    setIsAdding(true)
    try {
      await asignarPlazaUsuario(correo, {
        numeroPlaza: Number.parseInt(form.numeroPlaza, 10),
        idPuesto: Number.parseInt(form.idPuesto, 10),
        claseOcupacional: form.claseOcupacional.trim(),
        fechaInicio: form.fechaInicio,
        fechaFinal: form.fechaFinal || null,
      })
      notifySuccess(`Plaza '${form.numeroPlaza}' vinculada correctamente.`)
      setForm(EMPTY_FORM)
      await refrescar()
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDesasignar = async (row) => {
    const confirmado = await confirmDelete({
      title: '¿Desvincular plaza?',
      text: `La plaza ${row.numeroPlaza} quedará disponible para asignarse nuevamente. No se eliminará.`,
    })
    if (!confirmado) return

    setDeletingPlaza(row.numeroPlaza)
    try {
      await desasignarPlazaUsuario(correo, row.numeroPlaza)
      notifySuccess(`Plaza '${row.numeroPlaza}' desvinculada correctamente.`)
      await refrescar()
    } catch (err) {
      notifyApiError(err)
    } finally {
      setDeletingPlaza(null)
    }
  }

  const plazaOptions = availablePlazas.map((p) => ({
    value: String(p.numeroPlaza),
    label: `Plaza N.º ${p.numeroPlaza}`,
  }))

  const puestoOptions = puestos.map((p) => ({
    value: String(p.id),
    label: p.nombre,
  }))

  const columns = [
    { key: 'numeroPlaza', label: 'N.º Plaza', render: (r) => r.numeroPlaza },
    { key: 'puestoNombre', label: 'Puesto', render: (r) => r.puestoNombre ?? r.idPuesto },
    { key: 'claseOcupacional', label: 'Clase Ocupacional', render: (r) => r.claseOcupacional },
    { key: 'fechaInicio', label: 'Fecha Inicio', render: (r) => formatFecha(r.fechaInicio) },
  ]

  return (
    <section style={{ marginTop: '8px' }}>
      <h3
        style={{
          fontWeight: 700,
          fontSize: '16px',
          color: COLORS.labelColor,
          margin: '0 0 4px',
          paddingTop: '24px',
          borderTop: `1px solid ${COLORS.borderColor}`,
        }}
      >
        Plazas asignadas
      </h3>
      <p style={{ fontSize: '13px', color: COLORS.textMuted, margin: '0 0 16px' }}>
        Vincule o desvincule plazas disponibles para este usuario.
      </p>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando plazas...</p>
      ) : (
        <>
          {assignments.length > 0 ? (
            <EntityResultsTable
              columns={columns}
              rows={assignments}
              onDelete={handleDesasignar}
              deletingRowId={deletingPlaza}
              getRowId={(row) => row.numeroPlaza}
            />
          ) : (
            <p
              style={{
                textAlign: 'center',
                color: COLORS.textSubtle,
                backgroundColor: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              Este usuario no tiene plazas asignadas.
            </p>
          )}

          <div
            style={{
              backgroundColor: COLORS.surfaceAlt,
              border: `1px solid ${COLORS.borderColor}`,
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h4 style={{ fontWeight: 700, fontSize: '14px', color: COLORS.labelColor, margin: '0 0 16px' }}>
              Agregar plaza
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <FormSelect
                label="Plaza disponible"
                id="numeroPlaza"
                name="numeroPlaza"
                value={form.numeroPlaza}
                onChange={handleFieldChange}
                options={plazaOptions}
                defaultLabel={plazaOptions.length ? 'Seleccione una plaza' : 'No hay plazas disponibles'}
                required
                disabled={isAdding || plazaOptions.length === 0}
                error={errors.numeroPlaza}
              />
              <FormSelect
                label="Puesto"
                id="idPuesto"
                name="idPuesto"
                value={form.idPuesto}
                onChange={handleFieldChange}
                options={puestoOptions}
                defaultLabel="Seleccione un puesto"
                required
                disabled={isAdding}
                error={errors.idPuesto}
              />
            </div>

            <FormInput
              label="Clase Ocupacional"
              id="claseOcupacional"
              name="claseOcupacional"
              value={form.claseOcupacional}
              onChange={handleFieldChange}
              required
              disabled={isAdding}
              maxLength={190}
              error={errors.claseOcupacional}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <FormInput
                label="Fecha Inicio"
                id="fechaInicio"
                name="fechaInicio"
                type="date"
                value={form.fechaInicio}
                onChange={handleFieldChange}
                required
                disabled={isAdding}
                error={errors.fechaInicio}
              />
              <FormInput
                label="Fecha Final"
                id="fechaFinal"
                name="fechaFinal"
                type="date"
                value={form.fechaFinal}
                onChange={handleFieldChange}
                disabled={isAdding}
                error={errors.fechaFinal}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FormButton
                label={isAdding ? 'Agregando...' : 'Agregar'}
                type="button"
                variant="primary"
                onClick={handleAgregar}
                disabled={isAdding || plazaOptions.length === 0}
                width="auto"
              />
            </div>
          </div>
        </>
      )}
    </section>
  )
}

UserPositionsSection.propTypes = {
  correo: PropTypes.string.isRequired,
}
