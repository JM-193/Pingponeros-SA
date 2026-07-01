import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { login } from '../services/authService'
import { guardarSesion } from '../services/session'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'
import { EMAIL_REGEX } from '../constants/regex'

/* UCR brand palette
   Azul UCR  #00AEEF  (Pantone 299 C)
   Azul oscuro institucional  #1D4F91
   Footer   #2D2F34
   Fondo     #e6e6e6
   */

const TEMP_PASSWORD_EXPIRED_MESSAGE =
  'Contraseña expirada. Por favor realice el proceso de recuperación de contraseña.'

function temporaryPasswordExpired(usuario) {
  if (!usuario?.contrasenaTemporal || !usuario?.fechaExpiracionContrasena) return false

  const expirationTime = new Date(usuario.fechaExpiracionContrasena).getTime()
  return Number.isFinite(expirationTime) && expirationTime <= Date.now()
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'El correo debe ser válido. Formato: nombre.apellidos@ucr.ac.cr (solo letras antes de @)'
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setServerError('')
    setLoading(true)

    try {
      const { token, ...usuario } = await login(email.trim().toLowerCase(), password)
      if (usuario.estado !== undefined && usuario.estado !== 1) {
        setServerError('La cuenta de usuario se encuentra inactiva. Contacte al equipo de soporte.')
        return
      }
      if (temporaryPasswordExpired(usuario)) {
        setServerError(TEMP_PASSWORD_EXPIRED_MESSAGE)
        return
      }

      if (!token) {
        // Defensivo: si por alguna razón el backend no envió un token,
        // no se navega a /home con una sesión a medio iniciar.
        setServerError('No se pudo iniciar sesión. Intente de nuevo.')
        return
      }

      guardarSesion(token, usuario.contrasenaTemporal)

      // Una contraseña temporal debe cambiarse antes que nada; se envía al usuario
      // directamente a la página de cambio (allí se muestra la alerta bloqueante).
      if (usuario.contrasenaTemporal) {
        navigate('/cambiar-contrasena')
        return
      }

      notifySuccess('Sesión iniciada correctamente.')
      navigate('/home')
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
          fontSize: 'clamp(20px, 3vw, 30px)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          margin: '0 0 10px',
          color: COLORS.labelColor,
        }}
      >
        Vicerrectoría de Administración
      </h1>
      <h2
        style={{
          fontWeight: 800,
          fontSize: 'clamp(13px, 1.8vw, 18px)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          margin: '0 0 40px',
          color: COLORS.labelColor,
        }}
      >
        Aplicación de Cargas de Trabajo
      </h2>

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
            placeholder=""
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
            maxLength={100}
          />
          {errors.email && (
            <span style={{ fontSize: '12px', color: COLORS.danger }}>
              {errors.email}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
          <label
            htmlFor="password"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: COLORS.textLabel,
            }}
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            style={{
              padding: '14px 18px',
              border: errors.password ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderLight}`,
              borderRadius: '4px',
              fontSize: '15px',
              backgroundColor: COLORS.white,
              outline: 'none',
              color: COLORS.textDark,
              transition: 'border-color 0.2s',
            }}
            maxLength={30}
          />
          {errors.password && (
            <span style={{ fontSize: '12px', color: COLORS.danger }}>
              {errors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            backgroundColor: loading ? COLORS.authBtnDisabled : COLORS.authBtn,
            color: COLORS.white,
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          {loading ? 'Verificando...' : 'Iniciar Sesión'}
        </button>

        {serverError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.errorStrong, backgroundColor: COLORS.errorSoftBg, padding: '10px 14px', borderRadius: '6px', border: `1px solid ${COLORS.errorSoftBorder}`, fontSize: '14px', fontWeight: 600 }}>
            <span>&#9888;</span>
            <span>{serverError}</span>
          </div>
        )}
      </form>

      <div style={{ marginTop: '20px' }}>
        <a
          href="/recuperar-contrasena"
          style={{
            color: COLORS.authBtn,
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          Recuperar Contraseña
        </a>
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
