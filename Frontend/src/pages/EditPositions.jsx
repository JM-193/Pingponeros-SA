import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { actualizarPlaza, obtenerPlazaPorNumero } from '../services/positionService'
import { obtenerUnidades } from '../services/unitService'
import { obtenerDepartamentos } from '../services/departmentService'
import { obtenerSecciones } from '../services/sectionService'
import { obtenerAreas } from '../services/areaService'
import Modal from '../components/Modal'
import FormContainer from '../components/FormContainer'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import PageLayout from '../components/PageLayout'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { isUnidadInArea, resolvePlazaFieldChange } from '../utils/organizationHierarchy'
import { notifySuccess, notifyError, notifyApiError } from '../utils/notify'
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

export default function EditPositions({ isModal, isOpen, onSuccess, onClose, entityId }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const params = useParams()
  const numeroPlaza = entityId ?? params.numeroPlaza

  const [formData, setFormData] = useState(initialFormData)
  const [parentType, setParentType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  const [rawUnidades, setRawUnidades] = useState([])
  const [areaOptions, setAreaOptions] = useState([])
  const [allDepartamentosOptions, setAllDepartamentosOptions] = useState([])
  const [allSeccionesOptions, setAllSeccionesOptions] = useState([])
  const [allUnidadOptions, setAllUnidadOptions] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true)
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
        notifyApiError(err)
        if (isModal && onClose) {
          callbackTimeoutRef.current = setTimeout(() => onClose(), 2000)
        } else {
          delayedNavigate('/organizacion/plazas/consultar', 2000)
        }
      } finally {
        setIsLoading(false)
      }
    }
    cargarDatos()
  }, [numeroPlaza, navigate, isModal, onClose, delayedNavigate])

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
      .filter((u) => {
        const unidadId = String(u.id ?? u.idUnidad)
        return (
          unidadId === formData.idUnidad ||
          isUnidadInArea(u, formData.idArea, { rawDepartamentos, rawSecciones })
        )
      })
      .map((u) => ({ value: String(u.id ?? u.idUnidad), label: `Unidad de ${u.nombre}` }))
  }, [formData.idArea, formData.idUnidad, rawDepartamentos, rawSecciones, rawUnidades, allUnidadOptions])

  const applyHierarchyChange = useCallback(
    (name, value) => {
      const resolved = resolvePlazaFieldChange({
        formData,
        name,
        value,
        rawDepartamentos,
        rawSecciones,
        rawUnidades,
      })

      if (resolved.conflict) {
        notifyError(resolved.conflict)
      }
      if (resolved.parentType !== undefined) {
        setParentType(resolved.parentType)
      }
      setFormData(resolved.formData)
    },
    [formData, rawDepartamentos, rawSecciones, rawUnidades],
  )

  const handleAreaChange = useCallback(
    (e) => {
      applyHierarchyChange('idArea', e.target.value)
    },
    [applyHierarchyChange],
  )

  const handleParentTypeChange = useCallback(
    (e) => {
      const { value } = e.target
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

      if (conflict) notifyError(conflict)
      setFormData((prev) => ({
        ...prev,
        idDepartamento: value === 'departamento' ? prev.idDepartamento : '',
        idSeccion:      value === 'seccion'      ? prev.idSeccion      : '',
        idUnidad:       clearUnidad              ? ''                  : prev.idUnidad,
      }))
    },
    [formData, rawUnidades],
  )

  const handleFieldChange = useCallback(
    (e) => {
      const { name, value } = e.target
      if (name === 'idArea') {
        handleAreaChange(e)
        return
      }

      applyHierarchyChange(name, value)
    },
    [applyHierarchyChange, handleAreaChange],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.idDepartamento && formData.idSeccion) {
      notifyError('Una plaza no puede pertenecer a un departamento y a una sección al mismo tiempo.')
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
      notifySuccess('Plaza actualizada correctamente.')
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate(-1, 1500)
      }
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  const formContent = (
    <FormContainer
      onSubmit={handleSubmit}
      title={isModal ? undefined : 'Editar Plaza'}
      subtitle={isModal ? undefined : 'Modificar asignaciones de la plaza'}
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

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
        <FormButton
          type="button"
          variant="secondary"
          label="Cancelar"
          onClick={handleCancel}
        />
        <FormButton
          type="submit"
          label={isSubmitting ? 'Actualizando...' : 'Actualizar'}
          variant="primary"
          disabled={isSubmitting}
        />
      </div>
    </FormContainer>
  )

  const formBody = isLoading
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando datos de la plaza...</p>
    : formContent

  return isModal ? (
    <Modal isOpen={isOpen} title="Editar Plaza" onClose={handleCancel}>
      {formBody}
    </Modal>
  ) : (
    <PageLayout>
      {formBody}
    </PageLayout>
  )
}

EditPositions.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityId: PropTypes.string,
}

EditPositions.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityId: null,
}
