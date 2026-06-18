import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { actualizarArea, obtenerAreaPorNombre } from '../services/areaService'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import PageLayout from '../components/PageLayout'
import StateToggle from '../components/StateToggle'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormError, getOrganizationEntityPayload } from '../utils/organizationEntityForm'
import { COLORS } from '../constants/colors'

export default function EditAreas({ isModal, isOpen, onSuccess, onClose, entityName }) {
  const navigate = useNavigate()
  const params = useParams()
  const nombre = entityName ?? params.nombre
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
        if (isModal && onClose) {
          setTimeout(() => onClose(), 2000)
        } else {
          setTimeout(() => navigate('/organizacion/areas/consultar'), 2000)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (nombre) {
      cargarArea()
    }
  }, [nombre, navigate, isModal, onClose])

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
      if (isModal && onSuccess) {
        setTimeout(() => onSuccess(), 1200)
      } else {
        setTimeout(() => navigate('/organizacion/areas/consultar'), 1500)
      }
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

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/organizacion/areas/consultar')
    }
  }

  const formFields = (
    <>
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
    </>
  )

  if (isLoading && !formData.nombre) {
    if (isModal) {
      return (
        <OrganizationEntityFormModal
          isOpen={isOpen}
          title="Editar Área"
          onSubmit={(e) => e.preventDefault()}
          onClose={handleCancel}
          primaryLabel="Actualizar"
        >
          <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando área...</p>
        </OrganizationEntityFormModal>
      )
    }
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

  if (isModal) {
    return (
      <OrganizationEntityFormModal
        isOpen={isOpen}
        title="Editar Área"
        subtitle="Formulario de Actualización"
        onSubmit={handleSubmit}
        onClose={handleCancel}
        isBusy={isSubmitting}
        successMsg={successMsg}
        errorMsg={errorMsg}
        primaryLabel="Actualizar"
      >
        {formFields}
      </OrganizationEntityFormModal>
    )
  }

  return (
    <OrganizationEntityFormPage
      title="Editar Área"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      successMsg={successMsg}
      errorMsg={errorMsg}
      primaryLabel="Actualizar"
    >
      {formFields}
    </OrganizationEntityFormPage>
  )
}

EditAreas.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityName: PropTypes.string,
}

EditAreas.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityName: null,
}
