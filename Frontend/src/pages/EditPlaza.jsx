// EditPlaza.jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { actualizarPlaza, obtenerPlazaPorNumero } from '../services/plazaService'
import { obtenerUnidades } from '../services/unidadService'
import { obtenerDepartamentos } from '../services/departamentoService'
import { obtenerSecciones } from '../services/seccionService'
import { obtenerAreas } from '../services/areaService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import StatusMessage from '../components/StatusMessage'
import PageLayout from '../components/PageLayout'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { COLORS } from '../constants/colors'

const PARENT_TYPE_OPTIONS = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'seccion', label: 'Sección' },
]

const initialFormData = {
  idArea: '',
  idDepartamento: '',
  idSeccion: '',
  idUnidad: '',
}

function resolveConflicts(checks, value, newData) {
  let conflict = ''

  for (const { condition, rawList, idField, message } of checks) {
    if (!condition) continue

    const entity = rawList.find(
      (item) => String(item.id ?? item[idField]) === newData[idField]
    )
    if (entity?.idArea != null && String(entity.idArea) !== value) {
      newData[idField] = ''
      if (!conflict) conflict = message
    }
  }

  return conflict
}

export default function EditPlaza() {
  const navigate = useNavigate()
  const { numeroPlaza } = useParams()

  const [formData, setFormData] = useState(initialFormData)
  const [parentType, setParentType] = useState('') // 'departamento' | 'seccion' | ''
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [conflictError, setConflictError] = useState('')
  const [loadError, setLoadError] = useState('')

  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  const [rawUnidades, setRawUnidades] = useState([])
  const [areaOptions, setAreaOptions] = useState([])
  const [allDepartamentosOptions, setAllDepartamentosOptions] = useState([])
  const [allSeccionesOptions, setAllSeccionesOptions] = useState([])
  const [allUnidadOptions, setAllUnidadOptions] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [plaza, areas, departamentos, secciones, unidades] = await Promise.all([
          obtenerPlazaPorNumero(numeroPlaza),
          obtenerAreas(),
          obtenerDepartamentos(),
          obtenerSecciones(),
          obtenerUnidades(),
        ])

        const areaKey         = resolveOptionValueKey(areas,        ['id', 'idArea'])
        const deptKey         = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
        const secKey          = resolveOptionValueKey(secciones,     ['id', 'idSeccion'])
        const unidadKey       = resolveOptionValueKey(unidades,      ['id', 'idUnidad'])

        setRawDepartamentos(departamentos)
        setRawSecciones(secciones)
        setRawUnidades(unidades)

        setAreaOptions(buildLabeledOptions(areas,        { valueKey: areaKey,   labelPrefix: 'Área de ' }))
        setAllDepartamentosOptions(buildLabeledOptions(departamentos, { valueKey: deptKey,   labelPrefix: 'Departamento de ' }))
        setAllSeccionesOptions(buildLabeledOptions(secciones,     { valueKey: secKey,    labelPrefix: 'Sección de ' }))
        setAllUnidadOptions(buildLabeledOptions(unidades,      { valueKey: unidadKey, labelPrefix: 'Unidad de ' }))

        let pt = ''
        if (plaza.idDepartamento) pt = 'departamento'
        else if (plaza.idSeccion)  pt = 'seccion'
        setParentType(pt)

        setFormData({
          idArea:         plaza.idArea          ? String(plaza.idArea)          : '',
          idDepartamento: plaza.idDepartamento  ? String(plaza.idDepartamento)  : '',
          idSeccion:      plaza.idSeccion        ? String(plaza.idSeccion)       : '',
          idUnidad:       plaza.idUnidad         ? String(plaza.idUnidad)        : '',
        })
      } catch (err) {
        setLoadError(err.message)
        setTimeout(() => navigate('/organizacion/plazas/consultar'), 2000)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [numeroPlaza, navigate])

  // --- Filtered options driven by selected area ---
  const filteredDepartamentosOptions = useMemo(() => {
    if (!formData.idArea) return allDepartamentosOptions
    return rawDepartamentos
      .filter((d) => String(d.idArea) === String(formData.idArea))
      .map((d) => ({ value: String(d.id ?? d.idDepartamento), label: `Departamento de ${d.nombre}` }))
  }, [formData.idArea, rawDepartamentos, allDepartamentosOptions])

  const filteredSeccionesOptions = useMemo(() => {
    if (!formData.idArea) return allSeccionesOptions
    return rawSecciones
      .filter((s) => String(s.idArea) === String(formData.idArea))
      .map((s) => ({ value: String(s.id ?? s.idSeccion), label: `Sección de ${s.nombre}` }))
  }, [formData.idArea, rawSecciones, allSeccionesOptions])

  const filteredUnidadOptions = useMemo(() => {
    if (!formData.idArea) return allUnidadOptions
    return rawUnidades
      .filter((u) => String(u.idArea) === String(formData.idArea))
      .map((u) => ({ value: String(u.id ?? u.idUnidad), label: `Unidad de ${u.nombre}` }))
  }, [formData.idArea, rawUnidades, allUnidadOptions])

  // --- Handlers ---
  const clearFeedback = useCallback(() => {
    setSuccessMsg('')
    setErrorMsg('')
    setConflictError('')
  }, [])

  // Inside your component:
  const handleAreaChange = useCallback(
    (e) => {
      const { value } = e.target
      clearFeedback()

      const newData = { ...formData, idArea: value }

      if (!value) {
        setFormData(newData)
        return
      }

      const conflictChecks = [
        {
          condition: parentType === 'departamento' && formData.idDepartamento,
          rawList: rawDepartamentos,
          idField: 'idDepartamento',
          message: 'El departamento seleccionado no pertenece al área elegida. Seleccione un departamento válido.',
        },
        {
          condition: parentType === 'seccion' && formData.idSeccion,
          rawList: rawSecciones,
          idField: 'idSeccion',
          message: 'La sección seleccionada no pertenece al área elegida. Seleccione una sección válida.',
        },
        {
          condition: formData.idUnidad,
          rawList: rawUnidades,
          idField: 'idUnidad',
          message: 'La unidad seleccionada no pertenece al área elegida. Seleccione una unidad válida.',
        },
      ]

      const conflict = resolveConflicts(conflictChecks, value, newData)
      if (conflict) setConflictError(conflict)
      setFormData(newData)
    },
    [clearFeedback, formData, parentType, rawDepartamentos, rawSecciones, rawUnidades],
  )

  const handleParentTypeChange = useCallback(
    (e) => {
      const { value } = e.target
      clearFeedback()
      setParentType(value)

      let conflict = ''
      let clearUnidad = false

      if (formData.idUnidad) {
        const unidad = rawUnidades.find((u) => String(u.id ?? u.idUnidad) === formData.idUnidad)
        if (value === 'seccion' && formData.idDepartamento && unidad?.idDepartamento != null) {
          clearUnidad = true
          conflict = 'La unidad seleccionada no es compatible con el tipo de dependencia elegido. Seleccione una unidad válida.'
        }
        if (value === 'departamento' && formData.idSeccion && unidad?.idSeccion != null) {
          clearUnidad = true
          conflict = 'La unidad seleccionada no es compatible con el tipo de dependencia elegido. Seleccione una unidad válida.'
        }
      }

      if (conflict) setConflictError(conflict)
      setFormData((prev) => ({
        ...prev,
        idDepartamento: value === 'departamento' ? prev.idDepartamento : '',
        idSeccion:      value === 'seccion'      ? prev.idSeccion      : '',
        idUnidad:       clearUnidad              ? ''                  : prev.idUnidad,
      }))
    },
    [clearFeedback, formData, rawUnidades],
  )

  const handleFieldChange = useCallback(
    (e) => {
      if (e.target.name === 'idArea') {
        handleAreaChange(e)
        return
      }
      clearFeedback()
      const { name, value } = e.target
      const newData = { ...formData, [name]: value }

      if (value && formData.idUnidad) {
        const unidad = rawUnidades.find((u) => String(u.id ?? u.idUnidad) === formData.idUnidad)
        if (name === 'idDepartamento' && unidad?.idDepartamento != null && String(unidad.idDepartamento) !== value) {
          newData.idUnidad = ''
          setConflictError('La unidad seleccionada no pertenece al departamento elegido. Seleccione una unidad válida.')
        }
        if (name === 'idSeccion' && unidad?.idSeccion != null && String(unidad.idSeccion) !== value) {
          newData.idUnidad = ''
          setConflictError('La unidad seleccionada no pertenece a la sección elegida. Seleccione una unidad válida.')
        }
      }

      setFormData(newData)
    },
    [handleAreaChange, clearFeedback, formData, rawUnidades],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearFeedback()

    if (formData.idDepartamento && formData.idSeccion) {
      setConflictError('Una plaza no puede pertenecer a un departamento y a una sección al mismo tiempo.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        numeroPlaza:    Number.parseInt(numeroPlaza, 10),
        idUnidad:       formData.idUnidad       ? Number.parseInt(formData.idUnidad,       10) : null,
        idDepartamento: formData.idDepartamento ? Number.parseInt(formData.idDepartamento, 10) : null,
        idSeccion:      formData.idSeccion       ? Number.parseInt(formData.idSeccion,      10) : null,
        idArea:         formData.idArea          ? Number.parseInt(formData.idArea,          10) : null,
      }
      await actualizarPlaza(numeroPlaza, payload)
      setSuccessMsg(`Plaza '${numeroPlaza}' actualizada correctamente.`)
      setTimeout(() => navigate('/organizacion/plazas/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageLayout mainStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: COLORS.textSubtle }}>Cargando datos de la plaza...</p>
      </PageLayout>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>
      <Header />
      <Navbar />
      <main
        style={{
          flex: 1,
          padding: '40px 40px 60px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <FormContainer
          onSubmit={handleSubmit}
          title="Editar Plaza"
          subtitle="Modificar asignaciones de la plaza"
        >
          <p
            style={{
              textAlign: 'center',
              margin: '-16px 0 24px',
              fontSize: '15px',
              fontWeight: 600,
              color: COLORS.textMuted,
              letterSpacing: '0.03em',
            }}
          >
            N.° de Plaza:{' '}
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: COLORS.primaryBtn,
              }}
            >
              {numeroPlaza}
            </span>
          </p>

          {loadError && <StatusMessage variant="error" message={`Error al cargar datos: ${loadError}`} />}

          <FormSelect
            label="Área"
            id="idArea"
            name="idArea"
            value={formData.idArea}
            onChange={handleFieldChange}
            options={areaOptions}
            defaultLabel="-- Sin asignación --"
          />

          <FormSelect
            label="Tipo de dependencia"
            id="parentType"
            name="parentType"
            value={parentType}
            onChange={handleParentTypeChange}
            options={PARENT_TYPE_OPTIONS}
            defaultLabel="-- Sin asignación --"
          />

          {parentType === 'departamento' && (
            <FormSelect
              label="Departamento"
              id="idDepartamento"
              name="idDepartamento"
              value={formData.idDepartamento}
              onChange={handleFieldChange}
              options={filteredDepartamentosOptions}
              defaultLabel="-- Sin asignación --"
            />
          )}

          {parentType === 'seccion' && (
            <FormSelect
              label="Sección"
              id="idSeccion"
              name="idSeccion"
              value={formData.idSeccion}
              onChange={handleFieldChange}
              options={filteredSeccionesOptions}
              defaultLabel="-- Sin asignación --"
            />
          )}

          <FormSelect
            label="Unidad"
            id="idUnidad"
            name="idUnidad"
            value={formData.idUnidad}
            onChange={handleFieldChange}
            options={filteredUnidadOptions}
            defaultLabel="-- Sin asignación --"
          />

          {successMsg && <StatusMessage variant="success" message={successMsg} style={{ marginBottom: '20px' }} />}
          {(conflictError || errorMsg) && <StatusMessage variant="error" message={conflictError || errorMsg} style={{ marginBottom: '20px' }} />}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
            <FormButton
              type="button"
              variant="secondary"
              label="Regresar"
              onClick={() => navigate('/organizacion/plazas/consultar')}
            />
            <FormButton
              type="submit"
              label={isSubmitting ? 'Actualizando...' : 'Actualizar'}
              variant="primary"
              disabled={isSubmitting}
            />
          </div>
        </FormContainer>
      </main>
      <Footer />
    </div>
  )
}
