import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import StateToggle from '../components/StateToggle'
import { actualizarUnidad, obtenerUnidadPorNombre } from '../services/unitService'
import { obtenerAreas } from '../services/areaService'
import { obtenerDepartamentos } from '../services/departmentService'
import { obtenerSecciones } from '../services/sectionService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { COLORS } from '../constants/colors'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'
import { useUnitAreaFilters } from '../hooks/useUnitAreaFilters'

const parentTypeOptions = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'seccion', label: 'Sección' },
]

const initialFormData = {
  idArea: '',
  idDepartamento: '',
  idSeccion: '',
  nombre: '',
  descripcion: '',
  estado: 1,
}

export default function EditUnits({ isModal, isOpen, onSuccess, onClose, entityName }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const params = useParams()
  const nombre = entityName ?? params.nombre
  const [parentType, setParentType] = useState('')
  const [areaOptions, setAreaOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  const [nombreOriginal, setNombreOriginal] = useState('')
  const loadData = useCallback(async () => {
    const [unidad, areas, departamentos, secciones] = await Promise.all([
      obtenerUnidadPorNombre(nombre),
      obtenerAreas(),
      obtenerDepartamentos(),
      obtenerSecciones(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const departamentoValueKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
    const seccionValueKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])

    let resolvedParentType = ''
    if (unidad.idDepartamento) {
      resolvedParentType = 'departamento'
    } else if (unidad.idSeccion) {
      resolvedParentType = 'seccion'
    }

    return {
      formData: {
        idArea: unidad.idArea ? String(unidad.idArea) : '',
        idDepartamento: unidad.idDepartamento ? String(unidad.idDepartamento) : '',
        idSeccion: unidad.idSeccion ? String(unidad.idSeccion) : '',
        nombre: unidad.nombre,
        descripcion: unidad.descripcion,
        estado: unidad.estado ?? 1,
      },
      areaOptions: buildLabeledOptions(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' }),
      departmentOptions: buildLabeledOptions(departamentos, {
        valueKey: departamentoValueKey,
        labelPrefix: 'Departamento de ',
      }),
      sectionOptions: buildLabeledOptions(secciones, { valueKey: seccionValueKey, labelPrefix: 'Sección de ' }),
      parentType: resolvedParentType,
      nombreOriginal: unidad.nombre,
      rawDepartamentos: departamentos,
      rawSecciones: secciones,
    }
  }, [nombre])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setDepartmentOptions(result?.departmentOptions ?? [])
    setSectionOptions(result?.sectionOptions ?? [])
    setRawDepartamentos(result?.rawDepartamentos ?? [])
    setRawSecciones(result?.rawSecciones ?? [])
    setParentType(result?.parentType ?? '')
    setNombreOriginal(result?.nombreOriginal ?? '')
  }, [])

  const handleLoadError = useCallback(() => {
    if (isModal && onClose) {
      callbackTimeoutRef.current = setTimeout(() => onClose(), 2000)
    } else {
      delayedNavigate('/organizacion/unidades/consultar', 2000)
    }
  }, [delayedNavigate, isModal, onClose])

  const handleSuccess = useCallback(() => {
    if (isModal && onSuccess) {
      callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
    } else {
      delayedNavigate('/organizacion/unidades/consultar', 1500)
    }
  }, [delayedNavigate, isModal, onSuccess])

  const submitUpdate = useCallback(
    (payload) => actualizarUnidad(nombreOriginal, payload),
    [nombreOriginal],
  )

  const {
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    errors,
    clearFeedback,
    handleInputChange,
    handleSubmit,
  } = useOrganizationEntityForm({
    initialFormData,
    loadData,
    loadDeps: [nombre],
    shouldLoad: Boolean(nombre),
    onLoadSuccess: handleLoadSuccess,
    onLoadError: handleLoadError,
    getValidationOptions: () => ({
      entityLabel: 'unidad',
      nameArticle: 'de la',
      requireArea: false,
      parentType,
    }),
    getPayloadOptions: () => ({
      includeEstado: true,
      includeArea: true,
      parentType,
    }),
    onSubmit: submitUpdate,
    successMessage: 'Unidad actualizada correctamente',
    onSuccess: handleSuccess,
  })

  const { filteredDepartmentOptions, filteredSectionOptions, handleFieldChange, handleParentTypeChange } =
    useUnitAreaFilters({
      formData,
      setFormData,
      parentType,
      setParentType,
      departmentOptions,
      sectionOptions,
      rawDepartamentos,
      rawSecciones,
      clearFeedback,
      handleInputChange,
    })

  const handleStateChange = (newState) => {
    setFormData((prev) => ({ ...prev, estado: newState }))
    clearFeedback()
  }

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/organizacion/unidades/consultar')
    }
  }

  const formFields = (
    <>
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
        namePrefix="Unidad de"
        namePlaceholder="Nombre de la unidad"
        descriptionPlaceholder="Ingrese la descripción de la unidad"
        nameLabel="Nombre de la Unidad"
        descriptionLabel="Descripción de la Unidad"
        areaOptions={areaOptions}
        parentType={parentType}
        parentTypeOptions={parentTypeOptions}
        onParentTypeChange={handleParentTypeChange}
        parentTypeLabel="Departamento o sección (opcional)"
        parentTypeDefaultLabel="Seleccione una dependencia (opcional)"
        departmentOptions={filteredDepartmentOptions}
        sectionOptions={filteredSectionOptions}
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </>
  )

  const formBody = isLoading && !formData.nombre
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando unidad...</p>
    : formFields

  return isModal ? (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Editar Unidad"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Actualizar"
    >
      {formBody}
    </OrganizationEntityFormModal>
  ) : (
    <OrganizationEntityFormPage
      title="Editar Unidad"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Actualizar"
    >
      {formBody}
    </OrganizationEntityFormPage>
  )
}

EditUnits.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityName: PropTypes.string,
}

EditUnits.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityName: null,
}
