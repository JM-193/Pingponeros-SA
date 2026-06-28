import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { crearFuncion } from '../services/functionService'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

export default function CreateFunctions({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])

  const {
    formData,
    isSubmitting,
    errors,
    handleInputChange,
    handleSubmit,
    resetFormData,
  } = useOrganizationEntityForm({
    initialFormData: { nombre: '', descripcion: '' },
    getValidationOptions: { entityLabel: 'función oficial', nameArticle: 'de la' },
    getPayloadOptions: { includeEstado: false },
    onSubmit: (payload) => crearFuncion(payload),
    successMessage: 'Función oficial creada correctamente',
    onSuccess: () => {
      resetFormData()
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate('/funciones/consultar', 1500)
      }
    },
  })

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/funciones/consultar')
    }
  }

  const formFields = (
    <OrganizationEntityFormFields
      formData={formData}
      onChange={handleInputChange}
      errors={errors}
      namePrefix="Función Oficial"
      namePlaceholder="Nombre de la función oficial"
      descriptionPlaceholder="Ingrese la descripción de la función oficial"
      nameLabel="Nombre de la Función Oficial"
      descriptionLabel="Descripción de la Función Oficial"
      maxNameLength={100}
    />
  )

  return isModal ? (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Crear Función Oficial"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      {formFields}
    </OrganizationEntityFormModal>
  ) : (
    <OrganizationEntityFormPage
      title="Crear Función Oficial"
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

CreateFunctions.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateFunctions.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
