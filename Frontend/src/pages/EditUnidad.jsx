import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { actualizarUnidad, obtenerUnidadPorNombre } from '../services/unidadService'
import { obtenerAreas } from '../services/areaService'
import { obtenerDepartamentos } from '../services/departamentoService'
import { obtenerSecciones } from '../services/seccionService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { COLORS } from '../constants/colors'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'
import { useUnidadAreaFilters } from '../hooks/useUnidadAreaFilters'

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

export default function EditUnidad() {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const [parentType, setParentType] = useState('')
  const [areaOptions, setAreaOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  const [nombreOriginal, setNombreOriginal] = useState('')
  const loadData = useCallback(async () => {
    const [unidad, areas, departamentos, secciones] = await Promise.all([
      obtenerUnidadPorNombre(nombre),
      obtenerAreas(),
      obtenerDepartamentos(),
      obtenerSecciones(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const departamentoValueKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
    const seccionValueKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])

    let resolvedParentType = ''
    if (unidad.idDepartamento) {
      resolvedParentType = 'departamento'
    } else if (unidad.idSeccion) {
      resolvedParentType = 'seccion'
    }

    return {
      formData: {
        idArea: unidad.idArea ? String(unidad.idArea) : '',
        idDepartamento: unidad.idDepartamento ? String(unidad.idDepartamento) : '',
        idSeccion: unidad.idSeccion ? String(unidad.idSeccion) : '',
        nombre: unidad.nombre,
        descripcion: unidad.descripcion,
        estado: unidad.estado ?? 1,
      },
      areaOptions: buildLabeledOptions(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' }),
      departmentOptions: buildLabeledOptions(departamentos, {
        valueKey: departamentoValueKey,
        labelPrefix: 'Departamento de ',
      }),
      sectionOptions: buildLabeledOptions(secciones, { valueKey: seccionValueKey, labelPrefix: 'Sección de ' }),
      parentType: resolvedParentType,
      nombreOriginal: unidad.nombre,
      rawDepartamentos: departamentos,
      rawSecciones: secciones,
    }
  }, [nombre])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setDepartmentOptions(result?.departmentOptions ?? [])
    setSectionOptions(result?.sectionOptions ?? [])
    setRawDepartamentos(result?.rawDepartamentos ?? [])
    setRawSecciones(result?.rawSecciones ?? [])
    setParentType(result?.parentType ?? '')
    setNombreOriginal(result?.nombreOriginal ?? '')
  }, [])

  const handleLoadError = useCallback(() => {
    setTimeout(() => navigate('/organizacion/unidades/consultar'), 2000)
  }, [navigate])

  const handleSuccess = useCallback(() => {
    setTimeout(() => navigate('/organizacion/unidades/consultar'), 1500)
  }, [navigate])

  const submitUpdate = useCallback(
    (payload) => actualizarUnidad(nombreOriginal, payload),
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
    onSubmit: submitUpdate,
    successMessage: 'Unidad actualizada correctamente',
    onSuccess: handleSuccess,
  })

  const { filteredDepartmentOptions, filteredSectionOptions, handleFieldChange, conflictError, clearConflictError } =
    useUnidadAreaFilters({
      formData,
      setFormData,
      parentType,
      departmentOptions,
      sectionOptions,
      rawDepartamentos,
      rawSecciones,
      clearFeedback,
      handleInputChange,
    })

  const handleParentTypeChange = useCallback(
    (event) => {
      const { value } = event.target
      clearFeedback()
      clearConflictError()
      setParentType(value)
      setFormData((prev) => ({
        ...prev,
        idDepartamento: value === 'departamento' ? prev.idDepartamento : '',
        idSeccion: value === 'seccion' ? prev.idSeccion : '',
      }))
    },
    [clearConflictError, clearFeedback, setFormData, setParentType],
  )

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
        <p style={{ color: COLORS.textSubtle }}>Cargando unidad...</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Editar Unidad"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/organizacion/unidades/consultar')}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={conflictError || errorMsg}
      primaryLabel="Actualizar"
    >
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleFieldChange}
        namePrefix="Unidad de"
        namePlaceholder="Nombre de la unidad"
        descriptionPlaceholder="Ingrese la descripción de la unidad"
        areaOptions={areaOptions}
        parentType={parentType}
        parentTypeOptions={parentTypeOptions}
        onParentTypeChange={handleParentTypeChange}
        parentTypeLabel="Departamento o sección (opcional)"
        parentTypeDefaultLabel="Seleccione una dependencia (opcional)"
        departmentOptions={filteredDepartmentOptions}
        sectionOptions={filteredSectionOptions}
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </OrganizationEntityFormPage>
  )
}
