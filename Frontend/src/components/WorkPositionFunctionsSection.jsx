import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  obtenerFuncionesDePuesto,
  agregarFuncionAPuesto,
  quitarFuncionDePuesto,
} from '../services/workPositionService'
import { obtenerFunciones } from '../services/functionService'
import EntityResultsTable from './EntityResultsTable'
import FormSelect from './FormSelect'
import FormButton from './FormButton'
import { confirmDelete } from '../utils/alerts'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const asArray = (value) => (Array.isArray(value) ? value : [])

export default function WorkPositionFunctionsSection({ puesto, onClose }) {
  const [assigned, setAssigned] = useState([])
  const [allFunctions, setAllFunctions] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState(null)

  const refrescarAsignadas = useCallback(async () => {
    const data = await obtenerFuncionesDePuesto(puesto.id)
    setAssigned(asArray(data))
  }, [puesto.id])

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setIsLoading(true)
      try {
        const [asignadas, todas] = await Promise.all([
          obtenerFuncionesDePuesto(puesto.id),
          obtenerFunciones(),
        ])
        if (!activo) return
        setAssigned(asArray(asignadas))
        setAllFunctions(asArray(todas))
      } catch (err) {
        if (activo) notifyApiError(err)
      } finally {
        if (activo) setIsLoading(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [puesto.id])

  const availableOptions = allFunctions
    .filter((f) => !assigned.some((a) => a.id === f.id))
    .map((f) => ({ value: String(f.id), label: f.nombre }))

  const handleAgregar = async () => {
    if (!selectedId) {
      setError('Seleccione una función')
      return
    }
    setError(null)
    setIsAdding(true)
    try {
      await agregarFuncionAPuesto(puesto.id, Number.parseInt(selectedId, 10))
      notifySuccess('Función asignada correctamente.')
      setSelectedId('')
      await refrescarAsignadas()
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuitar = async (row) => {
    const confirmado = await confirmDelete({
      title: '¿Quitar función?',
      text: `La función "${row.nombre}" será desasignada de este puesto.`,
    })
    if (!confirmado) return

    setRemovingId(row.id)
    try {
      await quitarFuncionDePuesto(puesto.id, row.id)
      notifySuccess('Función desasignada correctamente.')
      await refrescarAsignadas()
    } catch (err) {
      notifyApiError(err)
    } finally {
      setRemovingId(null)
    }
  }

  // 30% + 60% = 90%, el 10% restante lo ocupa la columna de acciones
  const columns = [
    { key: 'nombre', label: 'Nombre', render: (r) => r.nombre, width: '30%' },
    { key: 'descripcion', label: 'Descripción', render: (r) => r.descripcion, width: '60%' },
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
        Funciones asignadas
      </h3>
      <p style={{ fontSize: '13px', color: COLORS.textMuted, margin: '0 0 16px' }}>
        Agregue o quite las funciones asociadas al puesto <strong>{puesto.nombre}</strong>.
      </p>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando funciones...</p>
      ) : (
        <>
          {assigned.length > 0 ? (
            <EntityResultsTable
              columns={columns}
              rows={assigned}
              onDelete={handleQuitar}
              deletingRowId={removingId}
              getRowId={(row) => row.id}
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
              Este puesto no tiene funciones asignadas.
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
              Agregar función
            </h4>

            <FormSelect
              label="Función disponible"
              id="idFuncion"
              name="idFuncion"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value)
                if (error) setError(null)
              }}
              options={availableOptions}
              defaultLabel={availableOptions.length ? 'Seleccione una función' : 'Todas las funciones ya están asignadas'}
              required
              disabled={isAdding || availableOptions.length === 0}
              error={error}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FormButton
                label={isAdding ? 'Agregando...' : 'Agregar'}
                type="button"
                variant="primary"
                onClick={handleAgregar}
                disabled={isAdding || availableOptions.length === 0}
                width="auto"
              />
            </div>
          </div>

          {onClose && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <FormButton
                label="Cerrar"
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isAdding}
                width="auto"
              />
            </div>
          )}
        </>
      )}
    </section>
  )
}

WorkPositionFunctionsSection.propTypes = {
  puesto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
}

WorkPositionFunctionsSection.defaultProps = {
  onClose: null,
}
