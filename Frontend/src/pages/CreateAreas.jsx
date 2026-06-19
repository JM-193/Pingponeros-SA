import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { crearArea } from '../services/areaService'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormError, getOrganizationEntityPayload } from '../utils/organizationEntityForm'

export default function CreateAreas({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

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
      await crearArea(getOrganizationEntityPayload(formData, { includeEstado: true }))

      setSuccessMsg('Área creada correctamente')
      handleReset()
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
      successMsg={successMsg}
      errorMsg={errorMsg}
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
      successMsg={successMsg}
      errorMsg={errorMsg}
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
