import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { actualizarSeccion, obtenerSeccionPorNombre } from '../services/seccionService'
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

export default function EditSeccion() {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const [areaOptions, setAreaOptions] = useState([])
  const [nombreOriginal, setNombreOriginal] = useState('')
  const loadData = useCallback(async () => {
    const [seccion, areas] = await Promise.all([
      obtenerSeccionPorNombre(nombre),
      obtenerAreas(),
    ])
    const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])

    return {
      formData: {
        idArea: seccion.idArea ? String(seccion.idArea) : '',
        nombre: seccion.nombre,
        descripcion: seccion.descripcion,
        estado: seccion.estado ?? 1,
      },
      areaOptions: buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de ' }),
      nombreOriginal: seccion.nombre,
    }
  }, [nombre])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setNombreOriginal(result?.nombreOriginal ?? '')
  }, [])

  const handleLoadError = useCallback(() => {
    setTimeout(() => navigate('/organizacion/secciones/consultar'), 2000)
  }, [navigate])

  const handleSuccess = useCallback(() => {
    setTimeout(() => navigate('/organizacion/secciones/consultar'), 1500)
  }, [navigate])

  const submitUpdate = useCallback(
    (payload) => actualizarSeccion(nombreOriginal, payload),
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
      entityLabel: 'sección',
      nameArticle: 'de la',
      requireArea: true,
    },
    getPayloadOptions: { includeEstado: true, includeArea: true },
    onSubmit: submitUpdate,
    successMessage: 'Sección actualizada correctamente',
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
        <p style={{ color: COLORS.textSubtle }}>Cargando sección...</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Editar Sección"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/organizacion/secciones/consultar')}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Actualizar"
    >
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        namePrefix="Sección de"
        namePlaceholder="Nombre de la sección"
        descriptionPlaceholder="Ingrese la descripción de la sección"
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
