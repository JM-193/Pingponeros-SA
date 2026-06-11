// EditUser.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { obtenerUsuarioPorCorreo, actualizarUsuario } from '../services/userService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormRow from '../components/FormRow'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import StatusMessage from '../components/StatusMessage'
import StateToggle from '../components/StateToggle'
import { COLORS } from '../constants/colors'

export default function EditUser() {
  const navigate = useNavigate()
  const { correo } = useParams()
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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const NAME_FIELDS = new Set(['firstName', 'secondName', 'firstName_surname', 'secondName_surname'])
  const NAME_REGEX = /[^A-Za-záéíóúÁÉÍÓÚñÑüÜ]/g

  // Cargar el usuario al montar el componente
  useEffect(() => {
    const cargarUsuario = async () => {
      setLoading(true)
      setErrorMsg('')
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
        setErrorMsg(err.message)
        setTimeout(() => navigate('/usuarios/consultar'), 2000)
      } finally {
        setLoading(false)
      }
    }

    if (correo) {
      cargarUsuario()
    }
  }, [correo, navigate])

  const clearFeedback = () => {
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    clearFeedback()
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

  // Manejar envío del formulario de actualización
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    clearFeedback()

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
      setSuccessMsg('Usuario actualizado correctamente.')
      setTimeout(() => navigate('/usuarios/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !formData.email) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>
        {/* Header */}
        <Header />
        <Navbar />

        {/* Loading content */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: COLORS.textSubtle }}>Cargando usuario...</p>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>
      {/* Header */}
      <Header />

      <Navbar />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: '40px 40px 60px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <FormContainer
          onSubmit={handleSubmit}
          title="Editar Usuario"
          subtitle="Formulario de Actualización"
          requiredNote
        >
          {/* Fila 1: Primer nombre y Segundo nombre */}
          <FormRow columns={2}>
            <FormInput
              label="Primer Nombre"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={submitting}
            />
            <FormInput
              label="Segundo Nombre"
              id="secondName"
              name="secondName"
              value={formData.secondName}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </FormRow>

          {/* Fila 2: Primer apellido y Segundo apellido */}
          <FormRow columns={2}>
            <FormInput
              label="Primer Apellido"
              id="firstName_surname"
              name="firstName_surname"
              value={formData.firstName_surname}
              onChange={handleInputChange}
              required
              disabled={submitting}
            />
            <FormInput
              label="Segundo Apellido"
              id="secondName_surname"
              name="secondName_surname"
              value={formData.secondName_surname}
              onChange={handleInputChange}
              required
              disabled={submitting}
            />
          </FormRow>

          {/* Correo institucional (deshabilitado en edición) */}
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

          {/* Rol */}
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
            disabled={submitting}
          />

          {/* Estado del usuario */}
          <StateToggle
            currentState={formData.estado}
            onStateChange={handleStateChange}
            disabled={submitting}
          />

          {/* Mensajes de feedback */}
          {successMsg && (
            <StatusMessage variant="success" message={successMsg} />
          )}
          {errorMsg && (
            <StatusMessage variant="error" message={errorMsg} />
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <FormButton
              label="Regresar"
              type="button"
              variant="secondary"
              onClick={() => navigate('/usuarios/consultar')}
              disabled={submitting}
            />
            <FormButton
              label={submitting ? 'Guardando...' : 'Actualizar'}
              type="submit"
              variant="primary"
              disabled={submitting}
            />
          </div>
        </FormContainer>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
