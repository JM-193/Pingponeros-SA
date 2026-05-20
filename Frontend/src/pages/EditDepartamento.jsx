import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { actualizarDepartamento, obtenerDepartamentoPorNombre } from '../services/departamentoService'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormError,
  getOrganizationEntityPayload,
} from '../utils/OrganizationEntityForm'
import { COLORS } from '../constants/colors'

export default function EditDepartamento() {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const [formData, setFormData] = useState({
    idArea: '',
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [areaOptions, setAreaOptions] = useState([])
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
        const [departamento, areas] = await Promise.all([
          obtenerDepartamentoPorNombre(nombre),
          obtenerAreas(),
        ])
        const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
        setAreaOptions(buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de ' }))
        setFormData({
          idArea: departamento.idArea ? String(departamento.idArea) : '',
          nombre: departamento.nombre,
          descripcion: departamento.descripcion,
          estado: departamento.estado ?? 1,
        })
        setNombreOriginal(departamento.nombre)
      } catch (err) {
        setErrorMsg(err.message)
        setTimeout(() => navigate('/organizacion/departamentos/consultar'), 2000)
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
      await actualizarDepartamento(
        nombreOriginal,
        getOrganizationEntityPayload(formData, { includeEstado: true, includeArea: true }),
      )
      setSuccessMsg('Departamento actualizado correctamente')
      setTimeout(() => navigate('/organizacion/departamentos/consultar'), 1500)
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
