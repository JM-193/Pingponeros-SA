import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { crearPlaza } from '../services/positionService'
import { obtenerUnidades } from '../services/unitService'
import { obtenerDepartamentos } from '../services/departmentService'
import { obtenerSecciones } from '../services/sectionService'
import { obtenerAreas } from '../services/areaService'
import Modal from '../components/Modal'
import FormContainer from '../components/FormContainer'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import PageLayout from '../components/PageLayout'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { isUnidadInArea, resolvePlazaFieldChange } from '../utils/organizationHierarchy'
import { notifySuccess, notifyError, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const initialFormData = {
  numeroPlaza: '',
  idUnidad: '',
  idDepartamento: '',
  idSeccion: '',
  idArea: '',
}

const NUMERO_REGEX = /\D/g

export default function CreatePositions({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const [formData, setFormData] = useState(initialFormData)
  const [parentType, setParentType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [unidadOptions, setUnidadOptions] = useState([])
  const [departamentoOptions, setDepartamentoOptions] = useState([])
  const [seccionOptions, setSeccionOptions] = useState([])
  const [areaOptions, setAreaOptions] = useState([])
  const [rawUnidades, setRawUnidades] = useState([])
  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  useEffect(() => {
    const cargarOpciones = async () => {
      setIsLoading(true)
      try {
        const [unidades, departamentos, secciones, areas] = await Promise.all([
          obtenerUnidades(),
          obtenerDepartamentos(),
          obtenerSecciones(),
          obtenerAreas(),
        ])

        const unidadKey = resolveOptionValueKey(unidades, ['id', 'idUnidad'])
        const departamentoKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
        const seccionKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])
        const areaKey = resolveOptionValueKey(areas, ['id', 'idArea'])

        setRawUnidades(unidades)
        setRawDepartamentos(departamentos)
        setRawSecciones(secciones)
        setUnidadOptions(buildLabeledOptions(unidades, { valueKey: unidadKey, labelPrefix: 'Unidad de ' }))
        setDepartamentoOptions(buildLabeledOptions(departamentos, { valueKey: departamentoKey, labelPrefix: 'Departamento de ' }))
        setSeccionOptions(buildLabeledOptions(secciones, { valueKey: seccionKey, labelPrefix: 'Sección de ' }))
        setAreaOptions(buildLabeledOptions(areas, { valueKey: areaKey, labelPrefix: 'Área de ' }))
      } catch (err) {
        notifyApiError(err)
      } finally {
        setIsLoading(false)
      }
    }

    cargarOpciones()
  }, [])

  const filteredUnidadOptions = useMemo(() => {
    if (!formData.idArea) return unidadOptions
    return rawUnidades
      .filter((u) => {
        const unidadId = String(u.id ?? u.idUnidad)
        return (
          unidadId === formData.idUnidad ||
          isUnidadInArea(u, formData.idArea, { rawDepartamentos, rawSecciones })
        )
      })
      .map((u) => ({ value: String(u.id ?? u.idUnidad), label: `Unidad de ${u.nombre}` }))
  }, [formData.idArea, formData.idUnidad, rawDepartamentos, rawSecciones, rawUnidades, unidadOptions])

  const filteredDepartamentoOptions = useMemo(() => {
    if (!formData.idArea) return departamentoOptions
    return rawDepartamentos
      .filter((d) => String(d.idArea) === String(formData.idArea))
      .map((d) => ({ value: String(d.id ?? d.idDepartamento), label: `Departamento de ${d.nombre}` }))
  }, [formData.idArea, rawDepartamentos, departamentoOptions])

  const filteredSeccionOptions = useMemo(() => {
    if (!formData.idArea) return seccionOptions
    return rawSecciones
      .filter((s) => String(s.idArea) === String(formData.idArea))
      .map((s) => ({ value: String(s.id ?? s.idSeccion), label: `Sección de ${s.nombre}` }))
  }, [formData.idArea, rawSecciones, seccionOptions])

  const handleParentTypeChange = (e) => {
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
      idSeccion: value === 'seccion' ? prev.idSeccion : '',
      idUnidad: clearUnidad ? '' : prev.idUnidad,
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'numeroPlaza') {
      setErrors((prev) => (prev.numeroPlaza ? { ...prev, numeroPlaza: undefined } : prev))
      setFormData((prev) => ({ ...prev, numeroPlaza: value.replace(NUMERO_REGEX, '') }))
      return
    }

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const numero = Number.parseInt(formData.numeroPlaza, 10)
    if (!formData.numeroPlaza.trim()) {
      setErrors({ numeroPlaza: 'El número de plaza es obligatorio.' })
      return
    }
    if (!Number.isInteger(numero) || numero <= 0) {
      setErrors({ numeroPlaza: 'El número de plaza debe ser un entero positivo.' })
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      const payload = {
        numeroPlaza:    numero,
        idUnidad:       formData.idUnidad       ? Number.parseInt(formData.idUnidad, 10)       : null,
        idDepartamento: formData.idDepartamento ? Number.parseInt(formData.idDepartamento, 10) : null,
        idSeccion:      formData.idSeccion       ? Number.parseInt(formData.idSeccion, 10)      : null,
        idArea:         formData.idArea          ? Number.parseInt(formData.idArea, 10)         : null,
      }
      await crearPlaza(payload)
      notifySuccess(`Plaza '${numero}' creada correctamente.`)
      setFormData(initialFormData)
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
      title={isModal ? undefined : 'Crear Plaza'}
      subtitle={isModal ? undefined : 'Formulario de Registro'}
      requiredNote
    >
      <FormInput
        label="Número de Plaza"
        id="numeroPlaza"
        name="numeroPlaza"
        type="text"
        inputMode="numeric"
        value={formData.numeroPlaza}
        onChange={handleInputChange}
        maxLength={19}
        required
        error={errors.numeroPlaza}
      />

      <FormSelect
        label="Área"
        id="idArea"
        name="idArea"
        value={formData.idArea}
        onChange={handleInputChange}
        options={areaOptions}
        defaultLabel="-- Sin asignación --"
      />

      <FormSelect
        label="Tipo de dependencia"
        id="parentType"
        name="parentType"
        value={parentType}
        onChange={handleParentTypeChange}
        options={[
          { value: 'departamento', label: 'Departamento' },
          { value: 'seccion', label: 'Sección' },
        ]}
        defaultLabel="-- Sin asignación --"
      />

      {parentType === 'departamento' && (
        <FormSelect
          label="Departamento"
          id="idDepartamento"
          name="idDepartamento"
          value={formData.idDepartamento}
          onChange={handleInputChange}
          options={filteredDepartamentoOptions}
          defaultLabel="-- Sin asignación --"
        />
      )}

      {parentType === 'seccion' && (
        <FormSelect
          label="Sección"
          id="idSeccion"
          name="idSeccion"
          value={formData.idSeccion}
          onChange={handleInputChange}
          options={filteredSeccionOptions}
          defaultLabel="-- Sin asignación --"
        />
      )}

      <FormSelect
        label="Unidad"
        id="idUnidad"
        name="idUnidad"
        value={formData.idUnidad}
        onChange={handleInputChange}
        options={filteredUnidadOptions}
        defaultLabel="-- Sin asignación --"
      />

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
        <FormButton
          label="Cancelar"
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        />
        <FormButton
          label={isSubmitting ? 'Guardando...' : 'Crear'}
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        />
      </div>
    </FormContainer>
  )

  const formBody = isLoading
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando datos de organización...</p>
    : formContent

  return isModal ? (
    <Modal isOpen={isOpen} title="Crear Plaza" onClose={handleCancel}>
      {formBody}
    </Modal>
  ) : (
    <PageLayout>
      {formBody}
    </PageLayout>
  )
}

CreatePositions.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreatePositions.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
