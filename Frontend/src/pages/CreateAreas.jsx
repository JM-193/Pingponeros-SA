import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { crearArea } from '../services/areaService'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormErrors, getOrganizationEntityPayload } from '../utils/organizationEntityForm'
import { notifySuccess, notifyApiError } from '../utils/notify'

export default function CreateAreas({ isOpen, onSuccess, onClose }) {
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
      callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
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
    onClose()
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

  return (
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
  )
}

CreateAreas.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateAreas.defaultProps = {
  isOpen: false,
}
