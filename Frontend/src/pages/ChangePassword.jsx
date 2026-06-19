import { useState } from 'react'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PasswordChecklist from 'react-password-checklist'
import { obtenerSesion } from '../services/session'
import { cambiarContrasena } from '../services/authService'
import { COLORS } from '../constants/colors'
import FormContainer from '../components/FormContainer'
import PasswordInput from '../components/PasswordInput'
import FormButton from '../components/FormButton'
import StatusMessage from '../components/StatusMessage'

export default function ChangePassword() {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const [userEmail] = useState(() => {
    const sesion = obtenerSesion()
    return sesion?.correoInstitucional ?? ''
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validatePasswordComplexity = (password) => {
    const requirements = []
    if (password.length < 12) requirements.push('mínimo 12 caracteres')
    if (!/[A-Z]/.test(password)) requirements.push('una mayúscula')
    if (!/[a-z]/.test(password)) requirements.push('una minúscula')
    if (!/\d/.test(password)) requirements.push('un número')
    if (!/[!@#$%&*]/.test(password)) requirements.push('un carácter especial (!@#$%&*)')
    return requirements
  }

  const validateForm = (data) => {
    const newErrors = {}

    if (!data.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida'
    }

    if (data.newPassword) {
      const requirements = validatePasswordComplexity(data.newPassword)
      if (requirements.length > 0) {
        newErrors.newPassword = `La contraseña debe contener: ${requirements.join(', ')}`
      }
    } else {
      newErrors.newPassword = 'La nueva contraseña es requerida'
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'La confirmación de contraseña es requerida'
    } else if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual'
    }

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateForm(formData)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await cambiarContrasena(userEmail, formData.currentPassword, formData.newPassword)
      setSuccess(true)
      delayedNavigate('/home', 1500)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '500px' }}>
          {success ? (
            <StatusMessage
              variant="success"
              message="Contraseña Actualizada"
              style={{ textAlign: 'center' }}
            >
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                Tu contraseña ha sido cambiada exitosamente. Redirigiendo...
              </p>
            </StatusMessage>
          ) : (
            <FormContainer
              title="Cambiar Contraseña"
              onSubmit={handleSubmit}
            >
              <PasswordInput
                label="Contraseña Actual"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña actual"
                error={errors.currentPassword}
                required
              />

              <PasswordInput
                label="Nueva Contraseña"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Ingresa tu nueva contraseña"
                error={errors.newPassword}
                required
              />

              {formData.newPassword && (
                <div style={{ marginTop: '-12px', marginBottom: '20px' }}>
                  <PasswordChecklist
                    rules={['minLength', 'capital', 'lowercase', 'number', 'specialChar']}
                    minLength={12}
                    value={formData.newPassword}
                    validColor={COLORS.successColor}
                    invalidColor={COLORS.danger}
                    messages={{
                      minLength: 'Mínimo 12 caracteres',
                      capital: 'Una mayúscula',
                      lowercase: 'Una minúscula',
                      number: 'Un número',
                      specialChar: 'Un carácter especial (!@#$%&*)',
                    }}
                    iconSize={13}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              )}

              <PasswordInput
                label="Confirmar Nueva Contraseña"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirma tu nueva contraseña"
                error={errors.confirmPassword}
                required
              />

              {errors.submit && (
                <StatusMessage
                  variant="error"
                  message="Error"
                  style={{ marginBottom: '18px' }}
                >
                  {errors.submit}
                </StatusMessage>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <FormButton
                  label={loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  width="100%"
                />
              </div>

              <button
                onClick={() => navigate(-1)}
                type="button"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  background: 'none',
                  border: `1px solid ${COLORS.borderLight}`,
                  borderRadius: '4px',
                  color: COLORS.textDark,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancelar
              </button>
            </FormContainer>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
