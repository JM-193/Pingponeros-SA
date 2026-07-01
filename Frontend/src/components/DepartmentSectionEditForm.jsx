import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import OrganizationEntityFormFields from './OrganizationEntityFormFields'
import OrganizationEntityFormModal from './OrganizationEntityFormModal'
import StateToggle from './StateToggle'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'
import {
  DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
  getDepartmentSectionConfig,
} from '../utils/departmentSectionFormConfig'
import { COLORS } from '../constants/colors'

export default function DepartmentSectionEditForm({
  entityType,
  fetchByName,
  updateEntity,
  isOpen,
  onSuccess,
  onClose,
  entityName,
}) {
  const nombre = entityName
  const config = getDepartmentSectionConfig(entityType)
  const [areaOptions, setAreaOptions] = useState([])
  const [nombreOriginal, setNombreOriginal] = useState('')

  const loadData = useCallback(async () => {
    const [entity, areas] = await Promise.all([
      fetchByName(nombre),
      obtenerAreas(),
    ])
    const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])

    return {
      formData: {
        idArea: entity.idArea ? String(entity.idArea) : '',
        nombre: entity.nombre,
        descripcion: entity.descripcion,
        estado: entity.estado ?? 1,
      },
      areaOptions: buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de '}),
      nombreOriginal: entity.nombre,
    }
  }, [fetchByName, nombre])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setNombreOriginal(result?.nombreOriginal ?? '')
  }, [])

  const handleLoadError = useCallback(() => {
    setTimeout(() => onClose(), 2000)
  }, [onClose])

  const handleSuccess = useCallback(() => {
    setTimeout(() => onSuccess(), 1200)
  }, [onSuccess])

  const submitUpdate = useCallback(
    (payload) => updateEntity(nombreOriginal, payload),
    [updateEntity, nombreOriginal],
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
    initialFormData: DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
    loadData,
    loadDeps: [nombre],
    shouldLoad: Boolean(nombre),
    onLoadSuccess: handleLoadSuccess,
    onLoadError: handleLoadError,
    getValidationOptions: {
      entityLabel: config.entityLabel,
      nameArticle: config.nameArticle,
      requireArea: false,
    },
    getPayloadOptions: { includeEstado: true, includeArea: true },
    onSubmit: submitUpdate,
    successMessage: config.successEditMessage,
    onSuccess: handleSuccess,
  })

  const handleStateChange = (newState) => {
    setFormData((prev) => ({ ...prev, estado: newState }))
    clearFeedback()
  }

  const handleCancel = () => {
    onClose()
  }

  const formFields = (
    <>
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        errors={errors}
        namePrefix={config.namePrefix}
        namePlaceholder={config.namePlaceholder}
        descriptionPlaceholder={config.descriptionPlaceholder}
        nameLabel={config.nameLabel}
        descriptionLabel={config.descriptionLabel}
        areaOptions={areaOptions}
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </>
  )

  const formBody = isLoading && !formData.nombre
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>{config.loadingEditLabel}</p>
    : formFields

  return (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title={config.titleEdit}
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Actualizar"
    >
      {formBody}
    </OrganizationEntityFormModal>
  )
}

DepartmentSectionEditForm.propTypes = {
  entityType: PropTypes.oneOf(['departamento', 'seccion']).isRequired,
  fetchByName: PropTypes.func.isRequired,
  updateEntity: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  entityName: PropTypes.string.isRequired,
}

DepartmentSectionEditForm.defaultProps = {
  isOpen: false,
}
