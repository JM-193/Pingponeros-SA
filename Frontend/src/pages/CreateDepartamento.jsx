import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import PageLayout from '../components/PageLayout'
import { crearDepartamento } from '../services/departamentoService'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormError,
  getOrganizationEntityPayload,
} from '../utils/organizationEntityForm'
import { COLORS } from '../constants/colors'

export default function CreateDepartamento() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    idArea: '',
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [areaOptions, setAreaOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const loadAreas = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const areas = await obtenerAreas()
        const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
        setAreaOptions(buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de ' }))
      } catch (err) {
        setErrorMsg(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadAreas()
  }, [])

  const clearFeedback = () => {
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleInputChange = createOrganizationEntityInputChangeHandler(setFormData, clearFeedback)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearFeedback()

    const validationError = getOrganizationEntityFormError(formData, {
      entityLabel: 'departamento',
      nameArticle: 'del',
      requireArea: true,
    })
    if (validationError) {
      setErrorMsg(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      await crearDepartamento(getOrganizationEntityPayload(formData, { includeEstado: true, includeArea: true }))
      setSuccessMsg('Departamento creado correctamente')
      handleReset()
      setTimeout(() => navigate('/organizacion/departamentos/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      idArea: '',
      nombre: '',
      descripcion: '',
      estado: 1,
    })
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
