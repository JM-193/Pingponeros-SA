import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import OrganizationEntityFormModal from './OrganizationEntityFormModal'
import OrganizationEntityFormFields from './OrganizationEntityFormFields'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'
import {
  DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
  getDepartmentSectionConfig,
} from '../utils/departmentSectionFormConfig'
import { COLORS } from '../constants/colors'

export default function DepartmentSectionCreateForm({
  entityType,
  createEntity,
  isOpen,
  onSuccess,
  onClose,
}) {
  const config = getDepartmentSectionConfig(entityType)
  const [areaOptions, setAreaOptions] = useState([])

  const loadAreas = useCallback(async () => {
    const areas = await obtenerAreas()
    const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])

    return {
      areaOptions: buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de ' }),
    }
  }, [])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
  }, [])

  const handleSuccess = useCallback(
    ({ resetFormData }) => {
      resetFormData()
      setTimeout(() => onSuccess(), 1200)
    },
    [onSuccess],
  )

  const {
    formData,
    isLoading,
    isSubmitting,
    errors,
    handleInputChange,
    handleSubmit,
  } = useOrganizationEntityForm({
    initialFormData: DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
    loadData: loadAreas,
    onLoadSuccess: handleLoadSuccess,
    getValidationOptions: {
      entityLabel: config.entityLabel,
      nameArticle: config.nameArticle,
      requireArea: false,
    },
    getPayloadOptions: { includeEstado: true, includeArea: true },
    onSubmit: createEntity,
    successMessage: config.successCreateMessage,
    onSuccess: handleSuccess,
  })

  const handleCancel = () => {
    onClose()
  }

  const formFields = (
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
  )

  const formBody = isLoading
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando áreas...</p>
    : formFields

  return (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title={config.titleCreate}
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      {formBody}
    </OrganizationEntityFormModal>
  )
}

DepartmentSectionCreateForm.propTypes = {
  entityType: PropTypes.oneOf(['departamento', 'seccion']).isRequired,
  createEntity: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

DepartmentSectionCreateForm.defaultProps = {
  isOpen: false,
}
