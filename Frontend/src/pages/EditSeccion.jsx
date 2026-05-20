import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { actualizarSeccion, obtenerSeccionPorNombre } from '../services/seccionService'
import { obtenerAreas } from '../services/areaService'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormError,
  getOrganizationEntityPayload,
} from '../utils/organizationEntityForm'
import { COLORS } from '../constants/colors'

export default function EditSeccion() {
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
        const [seccion, areas] = await Promise.all([
          obtenerSeccionPorNombre(nombre),
          obtenerAreas(),
        ])
        const valueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
        setAreaOptions(buildLabeledOptions(areas, { valueKey, labelPrefix: 'Área de ' }))
        setFormData({
          idArea: seccion.idArea ? String(seccion.idArea) : '',
          nombre: seccion.nombre,
          descripcion: seccion.descripcion,
          estado: seccion.estado ?? 1,
        })
        setNombreOriginal(seccion.nombre)
      } catch (err) {
        setErrorMsg(err.message)
        setTimeout(() => navigate('/organizacion/secciones/consultar'), 2000)
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
      entityLabel: 'sección',
      nameArticle: 'de la',
      requireArea: true,
    })
    if (validationError) {
      setErrorMsg(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      await actualizarSeccion(
        nombreOriginal,
        getOrganizationEntityPayload(formData, { includeEstado: true, includeArea: true }),
      )
      setSuccessMsg('Sección actualizada correctamente')
      setTimeout(() => navigate('/organizacion/secciones/consultar'), 1500)
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
