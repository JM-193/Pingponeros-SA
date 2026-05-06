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

  // Manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSuccessMsg('')
    setTempPassword('')
    setErrorMsg('')
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (!formData.email.endsWith('@ucr.ac.cr')) {
      setErrorMsg('El correo debe terminar en @ucr.ac.cr')
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
        rol:                 NUMBER.parseInt(formData.role, 10),
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
            <div style={{ color: '#1b5e20', backgroundColor: '#e8f5e9', padding: '12px 16px', borderRadius: '6px', border: '1px solid #a5d6a7', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <span>&#10003;</span>
                <span>{successMsg}</span>
              </div>
              {tempPassword && (
                <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#fff', borderRadius: '4px', border: '1px dashed #66bb6a' }}>
                  <span style={{ fontWeight: 600 }}>Contraseña temporal: </span>
                  <code style={{ fontSize: '15px', letterSpacing: '1px', color: '#1b5e20' }}>{tempPassword}</code>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#388e3c' }}>Válida por 48 horas. Compártala con el usuario de forma segura.</div>
                </div>
              )}
            </div>
          )}
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b71c1c', backgroundColor: '#ffebee', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ef9a9a', fontSize: '14px', fontWeight: 600 }}>
              <span>&#9888;</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/home')}
              style={{
                padding: '12px 32px',
                backgroundColor: COLORS.secondaryBtn,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtnHover)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtn)}
            >
              Regresar
            </button>
            <FormButton label={loading ? 'Guardando...' : 'Crear Usuario'} type="submit" variant="primary" disabled={loading} />
          </div>
        </FormContainer>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
