import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const COLORS = {
  bodyBg: '#e9e9e9',
  btnBg: '#1D4F91',
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!email.endsWith('@ucr.ac.cr')) {
      newErrors.email = 'El correo debe terminar en @ucr.ac.cr'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSent(true)
    // TODO: llamada al endpoint de recuperación de contraseña
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
              fontWeight: 900,
              fontSize: 'clamp(20px, 3vw, 28px)',
              margin: '0 0 12px',
              color: '#1a1a1a',
            }}
          >
            ¿Olvidó su contraseña?
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#555',
              margin: '0 0 32px',
              lineHeight: 1.5,
            }}
          >
            Se enviará un código a su correo institucional para ayudarle a restablecer su contraseña.
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
              Si su correo está registrado, recibirá las instrucciones en breve.
            </div>
          ) : (
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
                  placeholder="Ingrese su correo institucional"
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

              <button
                type="submit"
                style={{
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
                Restablecer Contraseña
              </button>
            </form>
          )}

          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.btnBg,
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
