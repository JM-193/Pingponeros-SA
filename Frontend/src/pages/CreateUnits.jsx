import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { crearUnidad } from '../services/unitService'
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

export default function CreateUnits({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const [parentType, setParentType] = useState('')
  const [areaOptions, setAreaOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  const loadOptions = useCallback(async () => {
    const [areas, departamentos, secciones] = await Promise.all([
      obtenerAreas(),
      obtenerDepartamentos(),
      obtenerSecciones(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const departamentoValueKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
    const seccionValueKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])

    return {
      areaOptions: buildLabeledOptions(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' }),
      departmentOptions: buildLabeledOptions(departamentos, {
        valueKey: departamentoValueKey,
        labelPrefix: 'Departamento de ',
      }),
      sectionOptions: buildLabeledOptions(secciones, { valueKey: seccionValueKey, labelPrefix: 'Sección de ' }),
      rawDepartamentos: departamentos,
      rawSecciones: secciones,
    }
  }, [])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setDepartmentOptions(result?.departmentOptions ?? [])
    setSectionOptions(result?.sectionOptions ?? [])
    setRawDepartamentos(result?.rawDepartamentos ?? [])
    setRawSecciones(result?.rawSecciones ?? [])
  }, [])

  const handleSuccess = useCallback(
    ({ resetFormData }) => {
      resetFormData()
      setParentType('')
      if (isModal && onSuccess) {
        setTimeout(() => onSuccess(), 1200)
      } else {
        setTimeout(() => navigate('/organizacion/unidades/consultar'), 1500)
      }
    },
    [navigate, setParentType, isModal, onSuccess],
  )

  const {
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    successMsg,
    errorMsg,
    clearFeedback,
    handleInputChange,
    handleSubmit,
  } = useOrganizationEntityForm({
    initialFormData,
    loadData: loadOptions,
    onLoadSuccess: handleLoadSuccess,
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
    onSubmit: crearUnidad,
    successMessage: 'Unidad creada correctamente',
    onSuccess: handleSuccess,
  })

  const { filteredDepartmentOptions, filteredSectionOptions, handleFieldChange, handleParentTypeChange, conflictError } =
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

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/organizacion/unidades/consultar')
    }
  }

  const formFields = (
    <OrganizationEntityFormFields
      formData={formData}
      onChange={handleFieldChange}
      namePrefix="Unidad de"
      namePlaceholder="Nombre de la unidad"
      descriptionPlaceholder="Ingrese la descripción de la unidad"
      nameLabel="Nombre de la Unidad"
      descriptionLabel="Descripción de la Unidad"
      areaOptions={areaOptions}
      parentType={parentType}
      parentTypeOptions={parentTypeOptions}
      onParentTypeChange={handleParentTypeChange}
      parentTypeLabel="Tipo de dependencia"
      parentTypeDefaultLabel="Seleccione un tipo de dependencia (opcional)"
      departmentOptions={filteredDepartmentOptions}
      sectionOptions={filteredSectionOptions}
    />
  )

  const formBody = isLoading
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando datos de organización...</p>
    : formFields

  return isModal ? (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Crear Unidad"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={conflictError || errorMsg}
      primaryLabel="Crear"
    >
      {formBody}
    </OrganizationEntityFormModal>
  ) : (
    <OrganizationEntityFormPage
      title="Crear Unidad"
      subtitle="Formulario de Registro"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={conflictError || errorMsg}
      primaryLabel="Crear"
    >
      {formBody}
    </OrganizationEntityFormPage>
  )
}

CreateUnits.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateUnits.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
