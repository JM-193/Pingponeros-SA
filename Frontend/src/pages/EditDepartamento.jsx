import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { actualizarDepartamento, obtenerDepartamentoPorNombre } from '../services/departamentoService'
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

export default function EditDepartamento() {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const [areaOptions, setAreaOptions] = useState([])
  const [nombreOriginal, setNombreOriginal] = useState('')
  const loadData = useCallback(async () => {
    const [departamento, areas] = await Promise.all([
      obtenerDepartamentoPorNombre(nombre),
      obtenerAreas(),
    ])
    const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])

    return {
      formData: {
        idArea: departamento.idArea ? String(departamento.idArea) : '',
        nombre: departamento.nombre,
        descripcion: departamento.descripcion,
        estado: departamento.estado ?? 1,
      },
      areaOptions: buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de ' }),
      nombreOriginal: departamento.nombre,
    }
  }, [nombre])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setNombreOriginal(result?.nombreOriginal ?? '')
  }, [])

  const handleLoadError = useCallback(() => {
    setTimeout(() => navigate('/organizacion/departamentos/consultar'), 2000)
  }, [navigate])

  const handleSuccess = useCallback(() => {
    setTimeout(() => navigate('/organizacion/departamentos/consultar'), 1500)
  }, [navigate])

  const submitUpdate = useCallback(
    (payload) => actualizarDepartamento(nombreOriginal, payload),
    [nombreOriginal],
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
    loadData,
    loadDeps: [nombre],
    shouldLoad: Boolean(nombre),
    onLoadSuccess: handleLoadSuccess,
    onLoadError: handleLoadError,
    getValidationOptions: {
      entityLabel: 'departamento',
      nameArticle: 'del',
      requireArea: true,
    },
    getPayloadOptions: { includeEstado: true, includeArea: true },
    onSubmit: submitUpdate,
    successMessage: 'Departamento actualizado correctamente',
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
        <p style={{ color: COLORS.textSubtle }}>Cargando departamento...</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Editar Departamento"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/organizacion/departamentos/consultar')}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Actualizar"
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
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </OrganizationEntityFormPage>
  )
}
