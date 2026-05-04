import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

/* ── UCR brand palette ──────────────────────────────────────
   Azul UCR  #00AEEF  (Pantone 299 C)
   Azul oscuro institucional  #1D4F91
   Footer   #2D2F34
   Fondo     #e9e9e9
   ─────────────────────────────────────────────────────────── */

const COLORS = {
  bodyBg: '#e9e9e9',
  btnBg: '#1D4F91',
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}

    // Validar correo
    if (!email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!email.endsWith('@ucr.ac.cr')) {
      newErrors.email = 'El correo debe terminar en @ucr.ac.cr'
    }

    // Validar contraseña
    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    }

    // Si hay errores, mostrarlos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Limpiar errores si es válido
    setErrors({})
    // TODO: llamada al endpoint de autenticación
    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>

      {/* Header */}
      <Header />

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'Arial, sans-serif',
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
              fontFamily: 'Arial, sans-serif',
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
                  fontFamily: 'Arial, sans-serif',
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
                  fontFamily: 'Arial, sans-serif',
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
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#d10f0f' }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label
                htmlFor="password"
                style={{
                  fontFamily: 'Arial, sans-serif',
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
                  fontFamily: 'Arial, sans-serif',
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
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#d10f0f' }}>
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              style={{
                fontFamily: 'Arial, sans-serif',
                padding: '14px',
                backgroundColor: COLORS.btnBg,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.01em',
              }}
            >
              Iniciar Sesión
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <a
              href="/recuperar-contrasena"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: COLORS.btnBg,
                fontSize: '14px',
                textDecoration: 'underline',
              }}
            >
              Recuperar Contraseña
            </a>
            <p
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#777',
                margin: '10px 0 0',
              }}
            >
              Universidad De Costa Rica | Pingponeros S.A.
            </p>
          </div>
        </div>
      </main>

      <Footer />

    </div>
  )
}
