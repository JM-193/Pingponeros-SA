import { useEffect, useState } from 'react'
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
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormError,
  getOrganizationEntityPayload,
} from '../utils/organizationEntityForm'
import { COLORS } from '../constants/colors'

const parentTypeOptions = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'seccion', label: 'Sección' },
]

export default function EditUnidad() {
  const navigate = useNavigate()
  const { nombre } = useParams()
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
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const [unidad, areas, departamentos, secciones] = await Promise.all([
          obtenerUnidadPorNombre(nombre),
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

        let resolvedParentType = ''
        if (unidad.idDepartamento) {
          resolvedParentType = 'departamento'
        } else if (unidad.idSeccion) {
          resolvedParentType = 'seccion'
        }

        setParentType(resolvedParentType)
        setFormData({
          idArea: unidad.idArea ? String(unidad.idArea) : '',
          idDepartamento: unidad.idDepartamento ? String(unidad.idDepartamento) : '',
          idSeccion: unidad.idSeccion ? String(unidad.idSeccion) : '',
          nombre: unidad.nombre,
          descripcion: unidad.descripcion,
          estado: unidad.estado ?? 1,
        })
        setNombreOriginal(unidad.nombre)
      } catch (err) {
        setErrorMsg(err.message)
        setTimeout(() => navigate('/organizacion/unidades/consultar'), 2000)
      } finally {
        setIsLoading(false)
      }
    }

    if (nombre) {
      loadData()
    }
  }, [nombre, navigate])

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
      await actualizarUnidad(
        nombreOriginal,
        getOrganizationEntityPayload(formData, {
          includeEstado: true,
          includeArea: true,
          parentType,
        }),
      )
      setSuccessMsg('Unidad actualizada correctamente')
      setTimeout(() => navigate('/organizacion/unidades/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
      errorMsg={errorMsg}
      primaryLabel="Actualizar"
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
        parentTypeLabel="Departamento o sección"
        parentTypeDefaultLabel="Seleccione una dependencia"
        departmentOptions={departmentOptions}
        sectionOptions={sectionOptions}
        parentRequired
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </OrganizationEntityFormPage>
  )
}
