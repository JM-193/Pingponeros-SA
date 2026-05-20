import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import PageLayout from '../components/PageLayout'
import { crearUnidad } from '../services/unidadService'
import { obtenerAreas } from '../services/areaService'
import { obtenerDepartamentos } from '../services/departamentoService'
import { obtenerSecciones } from '../services/seccionService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormError,
  getOrganizationEntityPayload,
} from '../utils/OrganizationEntityForm'
import { COLORS } from '../constants/colors'

const parentTypeOptions = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'seccion', label: 'Sección' },
]

export default function CreateUnidad() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    idArea: '',
    idDepartamento: '',
    idSeccion: '',
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [parentType, setParentType] = useState('')
  const [areaOptions, setAreaOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const [areas, departamentos, secciones] = await Promise.all([
          obtenerAreas(),
          obtenerDepartamentos(),
          obtenerSecciones(),
        ])

        const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
        const departamentoValueKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
        const seccionValueKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])

        setAreaOptions(buildLabeledOptions(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' }))
        setDepartmentOptions(
          buildLabeledOptions(departamentos, { valueKey: departamentoValueKey, labelPrefix: 'Departamento de ' }),
        )
        setSectionOptions(buildLabeledOptions(secciones, { valueKey: seccionValueKey, labelPrefix: 'Sección de ' }))
      } catch (err) {
        setErrorMsg(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [])

  const clearFeedback = () => {
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleInputChange = createOrganizationEntityInputChangeHandler(setFormData, clearFeedback)

  const handleParentTypeChange = (event) => {
    const { value } = event.target
    clearFeedback()
    setParentType(value)
    setFormData((prev) => ({
      ...prev,
      idDepartamento: value === 'departamento' ? prev.idDepartamento : '',
      idSeccion: value === 'seccion' ? prev.idSeccion : '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearFeedback()

    const validationError = getOrganizationEntityFormError(formData, {
      entityLabel: 'unidad',
      nameArticle: 'de la',
      requireArea: true,
      requireParent: true,
      parentType,
    })
    if (validationError) {
      setErrorMsg(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      await crearUnidad(
        getOrganizationEntityPayload(formData, {
          includeEstado: true,
          includeArea: true,
          parentType,
        }),
      )
      setSuccessMsg('Unidad creada correctamente')
      handleReset()
      setTimeout(() => navigate('/organizacion/unidades/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      idArea: '',
      idDepartamento: '',
      idSeccion: '',
      nombre: '',
      descripcion: '',
      estado: 1,
    })
    setParentType('')
  }

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
      errorMsg={errorMsg}
      primaryLabel="Crear"
    >
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        namePrefix="Unidad de"
        namePlaceholder="Nombre de la unidad"
        descriptionPlaceholder="Ingrese la descripción de la unidad"
        areaOptions={areaOptions}
        areaRequired
        parentType={parentType}
        parentTypeOptions={parentTypeOptions}
        onParentTypeChange={handleParentTypeChange}
        parentTypeLabel="Tipo de dependencia"
        parentTypeDefaultLabel="Seleccione un tipo de dependencia"
        departmentOptions={departmentOptions}
        sectionOptions={sectionOptions}
        parentRequired
      />
    </OrganizationEntityFormPage>
  )
}
