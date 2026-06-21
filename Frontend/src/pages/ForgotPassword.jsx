import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { recuperarContrasena } from '../services/authService'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!/^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$/.test(email.trim())) {
      newErrors.email = 'El correo debe ser válido. Formato: nombre.apellidos@ucr.ac.cr (solo letras antes de @)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await recuperarContrasena(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1
        style={{
          fontWeight: 900,
          fontSize: 'clamp(20px, 3vw, 28px)',
          margin: '0 0 12px',
          color: COLORS.labelColor,
        }}
      >
        ¿Olvidó su contraseña?
      </h1>

      <p
        style={{
          fontSize: '14px',
          color: COLORS.textMuted,
          margin: '0 0 32px',
          lineHeight: 1.5,
        }}
      >
        Se le enviará su nueva contraseña temporal al correo institucional proporcionado.
      </p>

      {sent ? (
        <div
          style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '16px 18px',
            color: '#155724',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          Si su correo está registrado, recibirá la información en breve.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label
              htmlFor="email"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: COLORS.textLabel,
              }}
            >
              Correo Institucional
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su correo institucional"
              style={{
                padding: '14px 18px',
                border: errors.email ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderLight}`,
                borderRadius: '4px',
                fontSize: '15px',
                backgroundColor: COLORS.white,
                outline: 'none',
                color: COLORS.textDark,
                transition: 'border-color 0.2s',
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '12px', color: COLORS.danger }}>
                {errors.email}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              backgroundColor: loading ? COLORS.borderLight : COLORS.authBtn,
              color: COLORS.white,
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Enviando...' : 'Restablecer Contraseña'}
          </button>

        </form>
      )}

      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.authBtn,
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          ← Volver al inicio de sesión
        </button>
        <p
          style={{
            fontSize: '12px',
            color: COLORS.textLabel,
            margin: '10px 0 0',
          }}
        >
          Universidad De Costa Rica | Pingponeros S.A.
        </p>
      </div>
    </AuthLayout>
  )
}
