import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { crearUsuario } from '../services/userService'
import Modal from '../components/Modal'
import PageLayout from '../components/PageLayout'
import FormContainer from '../components/FormContainer'
import FormRow from '../components/FormRow'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { EMAIL_REGEX } from '../constants/regex'

export default function CreateUsers({ isModal, isOpen, onSuccess, onClose }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    firstName_surname: '',
    secondName_surname: '',
    email: '',
    role: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Errores de validación por campo (se muestran bajo cada control).
  const [errors, setErrors] = useState({})

  const NAME_FIELDS = new Set(['firstName', 'secondName', 'firstName_surname', 'secondName_surname'])
  const NAME_REGEX = /[^A-Za-záéíóúÁÉÍÓÚñÑüÜ]/g

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
    const sanitizedValue = NAME_FIELDS.has(name) ? value.replace(NAME_REGEX, '') : value
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'El primer nombre es requerido'
    if (!formData.firstName_surname.trim()) newErrors.firstName_surname = 'El primer apellido es requerido'
    if (!formData.secondName_surname.trim()) newErrors.secondName_surname = 'El segundo apellido es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'El correo debe ser válido. Formato: nombre@ucr.ac.cr (solo letras antes de @)'
    }
    if (formData.role !== '0' && formData.role !== '1') {
      newErrors.role = 'Debe seleccionar un rol'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      await crearUsuario({
        correoInstitucional: formData.email,
        primerNombre:        formData.firstName,
        segundoNombre:       formData.secondName || null,
        primerApellido:      formData.firstName_surname,
        segundoApellido:     formData.secondName_surname || null,
        rol:                 Number.parseInt(formData.role, 10),
      })
      notifySuccess('Usuario creado correctamente.')
      handleReset()
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate(-1, 1500)
      }
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: '',
      secondName: '',
      firstName_surname: '',
      secondName_surname: '',
      email: '',
      role: '',
    })
  }

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  const formContent = (
    <FormContainer
      onSubmit={handleSubmit}
      title={isModal ? undefined : 'Crear Usuario'}
      subtitle={isModal ? undefined : 'Formulario de Registro'}
      requiredNote
    >
      <FormRow columns={2}>
        <FormInput
          label="Primer Nombre"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          maxLength={20}
          required
          error={errors.firstName}
        />
        <FormInput
          label="Segundo Nombre"
          id="secondName"
          name="secondName"
          value={formData.secondName}
          onChange={handleInputChange}
          maxLength={20}
          error={errors.secondName}
        />
      </FormRow>

      <FormRow columns={2}>
        <FormInput
          label="Primer Apellido"
          id="firstName_surname"
          name="firstName_surname"
          value={formData.firstName_surname}
          onChange={handleInputChange}
          maxLength={20}
          required
          error={errors.firstName_surname}
        />
        <FormInput
          label="Segundo Apellido"
          id="secondName_surname"
          name="secondName_surname"
          value={formData.secondName_surname}
          onChange={handleInputChange}
          maxLength={20}
          required
          error={errors.secondName_surname}
        />
      </FormRow>

      <FormInput
        label="Correo Institucional"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        maxLength={100}
        required
        error={errors.email}
      />

      <FormSelect
        label="Rol"
        id="role"
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        options={[
          { value: '0', label: 'Funcionario' },
          { value: '1', label: 'Administrador' },
        ]}
        defaultLabel="-- Sin asignación --"
        required
        error={errors.role}
      />

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
        <FormButton
          label="Cancelar"
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        />
        <FormButton
          label={isSubmitting ? 'Guardando...' : 'Crear'}
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        />
      </div>
    </FormContainer>
  )

  return isModal ? (
    <Modal isOpen={isOpen} title="Crear Usuario" onClose={handleCancel}>
      {formContent}
    </Modal>
  ) : (
    <PageLayout>
      {formContent}
    </PageLayout>
  )
}

CreateUsers.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateUsers.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}
