import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { actualizarArea, obtenerAreaPorNombre } from '../services/areaService'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormError, getOrganizationEntityPayload } from '../utils/organizationEntityForm'
import { COLORS } from '../constants/colors'

export default function EditAreas() {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Cargar el área al montar el componente
  useEffect(() => {
    const cargarArea = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const area = await obtenerAreaPorNombre(nombre)
        setFormData({
          nombre: area.nombre,
          descripcion: area.descripcion,
          estado: area.estado ?? 1,
        })
        setNombreOriginal(area.nombre)
      } catch (err) {
        setErrorMsg(err.message)
        setTimeout(() => navigate('/organizacion/areas/consultar'), 2000)
      } finally {
        setIsLoading(false)
      }
    }

    if (nombre) {
      cargarArea()
    }
  }, [nombre, navigate])

  const clearFeedback = () => {
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Manage changes in the fields
  const handleInputChange = createOrganizationEntityInputChangeHandler(setFormData, clearFeedback)

  // Manage form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearFeedback()

    const validationError = getOrganizationEntityFormError(formData, {
      entityLabel: 'área',
      nameArticle: 'del',
    })
    if (validationError) {
      setErrorMsg(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      await actualizarArea(nombreOriginal, getOrganizationEntityPayload(formData, { includeEstado: true }))

      setSuccessMsg('Área actualizada correctamente')
      // Redirigir después de 1.5 segundos
      setTimeout(() => navigate('/organizacion/areas/consultar'), 1500)
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
        <p style={{ color: COLORS.textSubtle }}>Cargando área...</p>
      </PageLayout>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Editar Área"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/organizacion/areas/consultar')}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Actualizar"
    >
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        namePrefix="Área de"
        namePlaceholder="Nombre del área"
        descriptionPlaceholder="Ingrese la descripción del área"
        nameLabel="Nombre del Área"
        descriptionLabel="Descripción del Área"
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </OrganizationEntityFormPage>
  )
}
