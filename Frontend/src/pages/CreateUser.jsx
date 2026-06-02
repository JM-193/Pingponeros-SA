import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearUsuario } from '../services/usuarioService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormRow from '../components/FormRow'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import StatusMessage from '../components/StatusMessage'
import { COLORS } from '../constants/colors'

export default function CreateUser() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    firstName_surname: '',
    secondName_surname: '',
    email: '',
    role: '',
  })
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const NAME_FIELDS = new Set(['firstName', 'secondName', 'firstName_surname', 'secondName_surname'])
  const NAME_REGEX = /[^A-Za-záéíóúÁÉÍÓÚñÑüÜ]/g

  // Manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSuccessMsg('')
    setTempPassword('')
    setErrorMsg('')
    const sanitizedValue = NAME_FIELDS.has(name) ? value.replace(NAME_REGEX, '') : value
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg('')
    setTempPassword('')
    setErrorMsg('')

    // Validaciones
    if (!formData.email.trim()) {
      setErrorMsg('El correo es requerido')
      setLoading(false)
      return
    }
    if (!/^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$/.test(formData.email.trim())) {
      setErrorMsg('El correo debe ser válido. Formato: nombre@ucr.ac.cr (solo letras antes de @)')
      setLoading(false)
      return
    }

    try {
      const data = await crearUsuario({
        correoInstitucional: formData.email,
        primerNombre:        formData.firstName,
        segundoNombre:       formData.secondName || null,
        primerApellido:      formData.firstName_surname,
        segundoApellido:     formData.secondName_surname || null,
        rol:                 Number.parseInt(formData.role, 10),
      })
      setSuccessMsg(data.mensaje ?? 'Usuario creado correctamente.')
      setTempPassword(data.contrasenaTemporal ?? '')
      handleReset()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Manejar limpiar formulario
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
          title="Crear Usuario"
          subtitle="Formulario de Registro"
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
            />
            <FormInput
              label="Segundo Nombre"
              id="secondName"
              name="secondName"
              value={formData.secondName}
              onChange={handleInputChange}
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
            />
            <FormInput
              label="Segundo Apellido"
              id="secondName_surname"
              name="secondName_surname"
              value={formData.secondName_surname}
              onChange={handleInputChange}
              required
            />
          </FormRow>

          {/* Correo institucional */}
          <FormInput
            label="Correo Institucional"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
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
          />

          {/* Mensajes de feedback */}
          {successMsg && (
            <StatusMessage variant="success" message={successMsg}>
              {tempPassword && (
                <div style={{ padding: '10px 14px', backgroundColor: COLORS.white, borderRadius: '4px', border: '1px dashed #66bb6a' }}>
                  <span style={{ fontWeight: 600 }}>Contraseña temporal: </span>
                  <code style={{ fontSize: '15px', letterSpacing: '1px', color: COLORS.successStrong }}>{tempPassword}</code>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#388e3c' }}>Válida por 48 horas. Compártala con el usuario de forma segura.</div>
                </div>
              )}
            </StatusMessage>
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
              onClick={() => navigate('/home')}
              disabled={loading}
            />
            <FormButton
              label={loading ? 'Guardando...' : 'Crear'}
              type="submit"
              variant="primary"
              disabled={loading}
            />
          </div>
        </FormContainer>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
