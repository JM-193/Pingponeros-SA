import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { crearPuesto } from '../services/workPositionService'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import { useOrganizationEntityForm } from '../hooks/useOrganizationEntityForm'

export default function CreateWorkPositions({ isModal, isOpen, onSuccess, onClose }) {
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
    getValidationOptions: { entityLabel: 'puesto', nameArticle: 'del' },
    getPayloadOptions: { includeEstado: false },
    onSubmit: (payload) => crearPuesto(payload),
    successMessage: 'Puesto de trabajo creado correctamente',
    onSuccess: () => {
      resetFormData()
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate('/organizacion/puestos-trabajo/consultar', 1500)
      }
    },
  })

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/organizacion/puestos-trabajo/consultar')
    }
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

  return isModal ? (
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
  ) : (
    <OrganizationEntityFormPage
      title="Crear Puesto de Trabajo"
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

CreateWorkPositions.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateWorkPositions.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
