import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { login } from '../services/authService'
import { guardarSesion } from '../services/session'

/* UCR brand palette
   Azul UCR  #00AEEF  (Pantone 299 C)
   Azul oscuro institucional  #1D4F91
   Footer   #2D2F34
   Fondo     #e9e9e9
   */

const COLORS = {
  btnBg: '#1D4F91',
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
    } else if (!/^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$/.test(email.trim())) {
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
      const usuario = await login(email.trim().toLowerCase(), password)
      guardarSesion(usuario)
      navigate('/home')
    } catch (err) {
      setServerError(err.message)
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
          color: '#1a1a1a',
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
          color: '#1a1a1a',
        }}
      >
        Aplicación de Cargas de Trabajo
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
          <label
            htmlFor="email"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#777',
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
              border: errors.email ? '2px solid #d10f0f' : '1px solid #d0d0d0',
              borderRadius: '4px',
              fontSize: '15px',
              backgroundColor: '#fff',
              outline: 'none',
              color: '#333',
              transition: 'border-color 0.2s',
            }}
          />
          {errors.email && (
            <span style={{ fontSize: '12px', color: '#d10f0f' }}>
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
              color: '#777',
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
              border: errors.password ? '2px solid #d10f0f' : '1px solid #d0d0d0',
              borderRadius: '4px',
              fontSize: '15px',
              backgroundColor: '#fff',
              outline: 'none',
              color: '#333',
              transition: 'border-color 0.2s',
            }}
          />
          {errors.password && (
            <span style={{ fontSize: '12px', color: '#d10f0f' }}>
              {errors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            backgroundColor: loading ? '#5a7db5' : COLORS.btnBg,
            color: '#fff',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b71c1c', backgroundColor: '#ffebee', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef9a9a', fontSize: '14px', fontWeight: 600 }}>
            <span>&#9888;</span>
            <span>{serverError}</span>
          </div>
        )}
      </form>

      <div style={{ marginTop: '20px' }}>
        <a
          href="/recuperar-contrasena"
          style={{
            color: COLORS.btnBg,
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          Recuperar Contraseña
        </a>
        <p
          style={{
            fontSize: '12px',
            color: '#777',
            margin: '10px 0 0',
          }}
        >
          Universidad De Costa Rica | Pingponeros S.A.
        </p>
      </div>
    </AuthLayout>
  )
}
