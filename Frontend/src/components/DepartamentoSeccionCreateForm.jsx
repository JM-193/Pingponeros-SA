import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationEntityFormPage from './OrganizationEntityFormPage'
import OrganizationEntityFormFields from './OrganizationEntityFormFields'
import PageLayout from './PageLayout'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'
import {
  DEPARTAMENTO_SECCION_INITIAL_FORM_DATA,
  getDepartamentoSeccionConfig,
} from '../utils/departamentoSeccionFormConfig'
import { COLORS } from '../constants/colors'

const loadingLabel = 'Cargando áreas...'
const subtitle = 'Formulario de Registro'

export default function DepartamentoSeccionCreateForm({ entityType, createEntity }) {
  const navigate = useNavigate()
  const config = getDepartamentoSeccionConfig(entityType)
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
      setTimeout(() => navigate(config.listPath), 1500)
    },
    [navigate, config.listPath],
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

  if (isLoading) {
    return (
      <PageLayout
        mainStyle={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: COLORS.textSubtle }}>{loadingLabel}</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title={config.titleCreate}
      subtitle={subtitle}
      onSubmit={handleSubmit}
      onCancel={() => navigate(config.listPath)}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Crear"
    >
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
    </OrganizationEntityFormPage>
  )
}

DepartamentoSeccionCreateForm.propTypes = {
  entityType: PropTypes.oneOf(['departamento', 'seccion']).isRequired,
  createEntity: PropTypes.func.isRequired,
}
