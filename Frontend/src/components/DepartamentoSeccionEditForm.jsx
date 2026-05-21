import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from './OrganizationEntityFormFields'
import OrganizationEntityFormPage from './OrganizationEntityFormPage'
import PageLayout from './PageLayout'
import StateToggle from './StateToggle'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'
import {
  DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
  getDepartamentoSeccionConfig,
} from '../utils/departamentoSeccionFormConfig'
import { COLORS } from '../constants/colors'

const subtitle = 'Formulario de Actualizaci\u00f3n'

export default function DepartamentoSeccionEditForm({
  entityType,
  fetchByName,
  updateEntity,
}) {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const config = getDepartamentoSeccionConfig(entityType)
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
      areaOptions: buildLabeledOptions(areas, { valueKey, labelPrefix: '\u00c1rea de ' }),
      nombreOriginal: entity.nombre,
    }
  }, [fetchByName, nombre])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setNombreOriginal(result?.nombreOriginal ?? '')
  }, [])

  const handleLoadError = useCallback(() => {
    setTimeout(() => navigate(config.listPath), 2000)
  }, [navigate, config.listPath])

  const handleSuccess = useCallback(() => {
    setTimeout(() => navigate(config.listPath), 1500)
  }, [navigate, config.listPath])

  const submitUpdate = useCallback(
    (payload) => updateEntity(nombreOriginal, payload),
    [updateEntity, nombreOriginal],
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
    initialFormData: DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
    loadData,
    loadDeps: [nombre],
    shouldLoad: Boolean(nombre),
    onLoadSuccess: handleLoadSuccess,
    onLoadError: handleLoadError,
    getValidationOptions: {
      entityLabel: config.entityLabel,
      nameArticle: config.nameArticle,
      requireArea: true,
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

  if (isLoading && !formData.nombre) {
    return (
      <PageLayout
        mainStyle={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: COLORS.textSubtle }}>{config.loadingEditLabel}</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title={config.titleEdit}
      subtitle={subtitle}
      onSubmit={handleSubmit}
      onCancel={() => navigate(config.listPath)}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Actualizar"
    >
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        namePrefix={config.namePrefix}
        namePlaceholder={config.namePlaceholder}
        descriptionPlaceholder={config.descriptionPlaceholder}
        areaOptions={areaOptions}
        areaRequired
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </OrganizationEntityFormPage>
  )
}

DepartamentoSeccionEditForm.propTypes = {
  entityType: PropTypes.oneOf(['departamento', 'seccion']).isRequired,
  fetchByName: PropTypes.func.isRequired,
  updateEntity: PropTypes.func.isRequired,
}
