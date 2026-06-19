import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationEntityFormPage from './OrganizationEntityFormPage'
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

const subtitle = 'Formulario de Registro'

export default function DepartmentSectionCreateForm({
  entityType,
  createEntity,
  isModal,
  isOpen,
  onSuccess,
  onClose,
}) {
  const navigate = useNavigate()
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
      if (isModal && onSuccess) {
        setTimeout(() => onSuccess(), 1200)
      } else {
        setTimeout(() => navigate(config.listPath), 1500)
      }
    },
    [navigate, config.listPath, isModal, onSuccess],
  )

  const {
    formData,
    isLoading,
    isSubmitting,
    successMsg,
    errorMsg,
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
    if (isModal && onClose) {
      onClose()
    } else {
      navigate(config.listPath)
    }
  }

  const formFields = (
    <OrganizationEntityFormFields
      formData={formData}
      onChange={handleInputChange}
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

  return isModal ? (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title={config.titleCreate}
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Crear"
    >
      {formBody}
    </OrganizationEntityFormModal>
  ) : (
    <OrganizationEntityFormPage
      title={config.titleCreate}
      subtitle={subtitle}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Crear"
    >
      {formBody}
    </OrganizationEntityFormPage>
  )
}

DepartmentSectionCreateForm.propTypes = {
  entityType: PropTypes.oneOf(['departamento', 'seccion']).isRequired,
  createEntity: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

DepartmentSectionCreateForm.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
