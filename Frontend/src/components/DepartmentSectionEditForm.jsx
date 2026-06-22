import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from './OrganizationEntityFormFields'
import OrganizationEntityFormPage from './OrganizationEntityFormPage'
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

const subtitle = 'Formulario de Actualización'

export default function DepartmentSectionEditForm({
  entityType,
  fetchByName,
  updateEntity,
  isModal,
  isOpen,
  onSuccess,
  onClose,
  entityName,
}) {
  const navigate = useNavigate()
  const params = useParams()
  const nombre = entityName ?? params.nombre
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
    if (isModal && onClose) {
      setTimeout(() => onClose(), 2000)
    } else {
      setTimeout(() => navigate(config.listPath), 2000)
    }
  }, [navigate, config.listPath, isModal, onClose])

  const handleSuccess = useCallback(() => {
    if (isModal && onSuccess) {
      setTimeout(() => onSuccess(), 1200)
    } else {
      setTimeout(() => navigate(config.listPath), 1500)
    }
  }, [navigate, config.listPath, isModal, onSuccess])

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
    if (isModal && onClose) {
      onClose()
    } else {
      navigate(config.listPath)
    }
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

  return isModal ? (
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
  ) : (
    <OrganizationEntityFormPage
      title={config.titleEdit}
      subtitle={subtitle}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Actualizar"
    >
      {formBody}
    </OrganizationEntityFormPage>
  )
}

DepartmentSectionEditForm.propTypes = {
  entityType: PropTypes.oneOf(['departamento', 'seccion']).isRequired,
  fetchByName: PropTypes.func.isRequired,
  updateEntity: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityName: PropTypes.string,
}

DepartmentSectionEditForm.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityName: null,
}
