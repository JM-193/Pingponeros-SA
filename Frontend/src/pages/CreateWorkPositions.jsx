import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { crearPuesto } from '../services/workPositionService'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

export default function CreateWorkPositions({ isOpen, onSuccess, onClose }) {
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
    getValidationOptions: { entityLabel: 'puesto', nameArticle: 'del' },
    getPayloadOptions: { includeEstado: false },
    onSubmit: (payload) => crearPuesto(payload),
    successMessage: 'Puesto de trabajo creado correctamente',
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
      namePrefix="Puesto de"
      namePlaceholder="Nombre del puesto de trabajo"
      descriptionPlaceholder="Ingrese la descripción del puesto de trabajo"
      nameLabel="Nombre del Puesto"
      descriptionLabel="Descripción del Puesto"
    />
  )

  return (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Crear Puesto de Trabajo"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      {formFields}
    </OrganizationEntityFormModal>
  )
}

CreateWorkPositions.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateWorkPositions.defaultProps = {
  isOpen: false,
}
