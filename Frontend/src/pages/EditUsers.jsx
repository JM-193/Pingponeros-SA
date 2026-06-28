import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { obtenerUsuarioPorCorreo, actualizarUsuario } from '../services/userService'
import { obtenerSesion } from '../services/session'
import Modal from '../components/Modal'
import PageLayout from '../components/PageLayout'
import FormContainer from '../components/FormContainer'
import FormRow from '../components/FormRow'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import StateToggle from '../components/StateToggle'
import UserPositionsSection from '../components/UserPositionsSection'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

export default function EditUsers({ isModal, isOpen, onSuccess, onClose, entityId }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const params = useParams()
  const correo = entityId ?? params.correo
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    firstName_surname: '',
    secondName_surname: '',
    email: '',
    role: '',
    estado: 1,
  })
  const [correoOriginal, setCorreoOriginal] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const NAME_FIELDS = new Set(['firstName', 'secondName', 'firstName_surname', 'secondName_surname'])
  const NAME_REGEX = /[^A-Za-záéíóúÁÉÍÓÚñÑüÜ]/g

  useEffect(() => {
    const cargarUsuario = async () => {
      setIsLoading(true)
      try {
        const user = await obtenerUsuarioPorCorreo(correo)
        setFormData({
          firstName: user.primerNombre || '',
          secondName: user.segundoNombre || '',
          firstName_surname: user.primerApellido || '',
          secondName_surname: user.segundoApellido || '',
          email: user.correoInstitucional || '',
          role: String(user.rol),
          estado: user.estado ?? 1,
        })
        setCorreoOriginal(user.correoInstitucional)
      } catch (err) {
        notifyApiError(err)
        if (isModal && onClose) {
          callbackTimeoutRef.current = setTimeout(() => onClose(), 2000)
        } else {
          delayedNavigate('/usuarios/consultar', 2000)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (correo) {
      cargarUsuario()
    }
  }, [correo, navigate, isModal, onClose, delayedNavigate])

  const clearFeedback = () => {
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
    const sanitizedValue = NAME_FIELDS.has(name) ? value.replace(NAME_REGEX, '') : value
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))
  }

  const handleStateChange = (newState) => {
    setFormData((prev) => ({ ...prev, estado: newState }))
    clearFeedback()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.role !== '0' && formData.role !== '1') {
      setErrors({ role: 'Debe seleccionar un rol' })
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      await actualizarUsuario(correoOriginal, {
        correoInstitucional: formData.email,
        primerNombre:        formData.firstName,
        segundoNombre:       formData.secondName || null,
        primerApellido:      formData.firstName_surname,
        segundoApellido:     formData.secondName_surname || null,
        rol:                 Number.parseInt(formData.role, 10),
        estado:              formData.estado,
      })
      notifySuccess('Usuario actualizado correctamente.')
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

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  // El usuario autenticado no puede modificar su propio rol: se bloquea como el correo.
  const correoSesion = obtenerSesion()?.correoInstitucional ?? ''
  const isOwnProfile =
    !!correoOriginal && correoSesion.toLowerCase() === correoOriginal.toLowerCase()

  const formContent = (
    <FormContainer
      onSubmit={handleSubmit}
      title={isModal ? undefined : 'Editar Usuario'}
      subtitle={isModal ? undefined : 'Formulario de Actualización'}
      requiredNote
    >
      <FormRow columns={2}>
        <FormInput
          label="Primer Nombre"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
          disabled={true}
        />
        <FormInput
          label="Segundo Nombre"
          id="secondName"
          name="secondName"
          value={formData.secondName}
          onChange={handleInputChange}
          disabled={true}
        />
      </FormRow>

      <FormRow columns={2}>
        <FormInput
          label="Primer Apellido"
          id="firstName_surname"
          name="firstName_surname"
          value={formData.firstName_surname}
          onChange={handleInputChange}
          required
          disabled={true}
        />
        <FormInput
          label="Segundo Apellido"
          id="secondName_surname"
          name="secondName_surname"
          value={formData.secondName_surname}
          onChange={handleInputChange}
          required
          disabled={true}
        />
      </FormRow>

      <FormInput
        label="Correo Institucional"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
        disabled={true}
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
        defaultLabel="Seleccione un rol"
        required
        disabled={isSubmitting || isOwnProfile}
        error={errors.role}
      />

      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />

      {correoOriginal && <UserPositionsSection correo={correoOriginal} />}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
        <FormButton
          label="Cancelar"
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        />
        <FormButton
          label={isSubmitting ? 'Guardando...' : 'Actualizar'}
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        />
      </div>
    </FormContainer>
  )

  const formBody = isLoading && !formData.email
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando usuario...</p>
    : formContent

  return isModal ? (
    <Modal isOpen={isOpen} title="Editar Usuario" onClose={handleCancel}>
      {formBody}
    </Modal>
  ) : (
    <PageLayout>
      {formBody}
    </PageLayout>
  )
}

EditUsers.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityId: PropTypes.string,
}

EditUsers.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityId: null,
}
