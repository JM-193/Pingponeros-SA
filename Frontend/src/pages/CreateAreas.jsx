import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { crearArea } from '../services/areaService'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormErrors, getOrganizationEntityPayload } from '../utils/organizationEntityForm'
import { notifySuccess, notifyApiError } from '../utils/notify'

export default function CreateAreas({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const clearFeedback = () => {
    setErrors({})
  }

  const handleInputChange = createOrganizationEntityInputChangeHandler(setFormData, clearFeedback)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const validationErrors = getOrganizationEntityFormErrors(formData, {
      entityLabel: 'área',
      nameArticle: 'del',
    })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      await crearArea(getOrganizationEntityPayload(formData, { includeEstado: true }))

      notifySuccess('Área creada correctamente')
      handleReset()
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate('/organizacion/areas/consultar', 1500)
      }
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      estado: 1,
    })
  }

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/organizacion/areas/consultar')
    }
  }

  const formFields = (
    <OrganizationEntityFormFields
      formData={formData}
      onChange={handleInputChange}
      errors={errors}
      namePrefix="Área de"
      namePlaceholder="Nombre del área"
      descriptionPlaceholder="Ingrese la descripción del área"
      nameLabel="Nombre del Área"
      descriptionLabel="Descripción del Área"
    />
  )

  return isModal ? (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Crear Área"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      {formFields}
    </OrganizationEntityFormModal>
  ) : (
    <OrganizationEntityFormPage
      title="Crear Área"
      subtitle="Formulario de Registro"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      {formFields}
    </OrganizationEntityFormPage>
  )
}

CreateAreas.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateAreas.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
