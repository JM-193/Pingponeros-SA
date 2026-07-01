import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { crearFuncion } from '../services/functionService'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

export default function CreateFunctions({ isOpen, onSuccess, onClose }) {
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
      callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
    },
  })

  const handleCancel = () => {
    onClose()
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

  return (
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
  )
}

CreateFunctions.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateFunctions.defaultProps = {
  isOpen: false,
}
