import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import PageLayout from '../components/PageLayout'
import { crearUnidad } from '../services/unidadService'
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

export default function CreateUnidad() {
  const navigate = useNavigate()
  const [parentType, setParentType] = useState('')
  const [areaOptions, setAreaOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [rawDepartamentos, setRawDepartamentos] = useState([])
  const [rawSecciones, setRawSecciones] = useState([])
  const loadOptions = useCallback(async () => {
    const [areas, departamentos, secciones] = await Promise.all([
      obtenerAreas(),
      obtenerDepartamentos(),
      obtenerSecciones(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const departamentoValueKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
    const seccionValueKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])

    return {
      areaOptions: buildLabeledOptions(areas, { valueKey: areaValueKey }),
      departmentOptions: buildLabeledOptions(departamentos, {
        valueKey: departamentoValueKey,
        labelPrefix: 'Departamento de ',
      }),
      sectionOptions: buildLabeledOptions(secciones, { valueKey: seccionValueKey, labelPrefix: 'Sección de ' }),
      rawDepartamentos: departamentos,
      rawSecciones: secciones,
    }
  }, [])

  const handleLoadSuccess = useCallback((result) => {
    setAreaOptions(result?.areaOptions ?? [])
    setDepartmentOptions(result?.departmentOptions ?? [])
    setSectionOptions(result?.sectionOptions ?? [])
    setRawDepartamentos(result?.rawDepartamentos ?? [])
    setRawSecciones(result?.rawSecciones ?? [])
  }, [])

  const handleSuccess = useCallback(
    ({ resetFormData }) => {
      resetFormData()
      setParentType('')
      setTimeout(() => navigate('/organizacion/unidades/consultar'), 1500)
    },
    [navigate, setParentType],
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
    loadData: loadOptions,
    onLoadSuccess: handleLoadSuccess,
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
    onSubmit: crearUnidad,
    successMessage: 'Unidad creada correctamente',
    onSuccess: handleSuccess,
  })

  const { filteredDepartmentOptions, filteredSectionOptions, handleFieldChange, handleParentTypeChange, conflictError } =
    useUnidadAreaFilters({
      formData,
      setFormData,
      parentType,
      setParentType,
      departmentOptions,
      sectionOptions,
      rawDepartamentos,
      rawSecciones,
      clearFeedback,
      handleInputChange,
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
        <p style={{ color: COLORS.textSubtle }}>Cargando datos de organización...</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Crear Unidad"
      subtitle="Formulario de Registro"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/organizacion/unidades/consultar')}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={conflictError || errorMsg}
      primaryLabel="Crear"
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
        parentTypeLabel="Tipo de dependencia"
        parentTypeDefaultLabel="Seleccione un tipo de dependencia (opcional)"
        departmentOptions={filteredDepartmentOptions}
        sectionOptions={filteredSectionOptions}
      />
    </OrganizationEntityFormPage>
  )
}
