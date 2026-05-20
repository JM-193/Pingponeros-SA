import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import PageLayout from '../components/PageLayout'
import { crearDepartamento } from '../services/departamentoService'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { COLORS } from '../constants/colors'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

const initialFormData = {
  idArea: '',
  nombre: '',
  descripcion: '',
  estado: 1,
}

export default function CreateDepartamento() {
  const navigate = useNavigate()
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
      setTimeout(() => navigate('/organizacion/departamentos/consultar'), 1500)
    },
    [navigate],
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
    initialFormData,
    loadData: loadAreas,
    onLoadSuccess: handleLoadSuccess,
    getValidationOptions: {
      entityLabel: 'departamento',
      nameArticle: 'del',
      requireArea: true,
    },
    getPayloadOptions: { includeEstado: true, includeArea: true },
    onSubmit: crearDepartamento,
    successMessage: 'Departamento creado correctamente',
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
        <p style={{ color: COLORS.textSubtle }}>Cargando áreas...</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Crear Departamento"
      subtitle="Formulario de Registro"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/organizacion/departamentos/consultar')}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Crear"
    >
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        namePrefix="Departamento de"
        namePlaceholder="Nombre del departamento"
        descriptionPlaceholder="Ingrese la descripción del departamento"
        areaOptions={areaOptions}
        areaRequired
      />
    </OrganizationEntityFormPage>
  )
}
