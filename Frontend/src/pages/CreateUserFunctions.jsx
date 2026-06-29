import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { crearFuncionUsuario } from '../services/userFunctionService'
import { obtenerSesion } from '../services/session'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

export default function CreateUserFunctions({ isOpen, onSuccess, onClose }) {
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])

  const sesion = obtenerSesion()

  const {
    formData,
    isSubmitting,
    errors,
    handleInputChange,
    handleSubmit,
    resetFormData,
  } = useOrganizationEntityForm({
    initialFormData: { nombre: '', descripcion: '' },
    getValidationOptions: { entityLabel: 'función', nameArticle: 'de la' },
    getPayloadOptions: { includeEstado: false },
    onSubmit: (payload) =>
      crearFuncionUsuario({ ...payload, correoInstitucional: sesion?.correoInstitucional }),
    successMessage: 'Función de usuario creada correctamente',
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
      namePrefix="Función"
      namePlaceholder="Nombre de la función"
      descriptionPlaceholder="Ingrese la descripción de la función"
      nameLabel="Nombre de la Función"
      descriptionLabel="Descripción de la Función"
      maxNameLength={100}
    />
  )

  return (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Crear Función de Usuario"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      {formFields}
    </OrganizationEntityFormModal>
  )
}

CreateUserFunctions.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateUserFunctions.defaultProps = {
  isOpen: false,
}
