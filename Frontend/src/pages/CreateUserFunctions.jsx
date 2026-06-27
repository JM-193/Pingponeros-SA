import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { crearFuncionUsuario } from '../services/userFunctionService'
import { obtenerSesion } from '../services/session'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

export default function CreateUserFunctions({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
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
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate('/funciones/usuarios/consultar', 1500)
      }
    },
  })

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/funciones/usuarios/consultar')
    }
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

  return isModal ? (
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
  ) : (
    <OrganizationEntityFormPage
      title="Crear Función de Usuario"
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

CreateUserFunctions.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateUserFunctions.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
