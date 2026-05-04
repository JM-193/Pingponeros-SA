import { useNavigate } from 'react-router-dom'

import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const COLORS = {
  bodyBg: '#e9e9e9',
  btnBg: '#1D4F91',
}

const ACTION_CARDS = [
  {
    description: 'En este apartado puede crear un nuevo usuario en el sistema.',
    label: 'Crear usuario',
  },
  {
    description: 'En este apartado puede agregar un número de plaza para un usuario específico.',
    label: 'Asignar N° de plaza',
  },
  {
    description: 'En este apartado puede conocer la información relacionada sobre un usuario específico.',
    label: 'Consultar usuario',
  },
]

export default function Users() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>

      {/* Header */}
      <Header />

      <Navbar />

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px 40px 60px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Page titles */}
        <h1
          style={{
            fontWeight: 900,
            fontSize: 'clamp(22px, 2.5vw, 34px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
            margin: '0 0 10px',
            color: '#1a1a1a',
          }}
        >
          Vicerrectoría de Administración
        </h1>

        <h2
          style={{
            fontWeight: 800,
            fontSize: 'clamp(14px, 1.8vw, 22px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
            margin: '0 0 36px',
            color: '#1a1a1a',
          }}
        >
          Gestión de Usuarios
        </h2>

        {/* Action cards */}
        <div
          style={{
            maxWidth: '620px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {ACTION_CARDS.map((card) => (
            <div
              key={card.label}
              style={{
                backgroundColor: '#d9d9d9',
                borderRadius: '8px',
                padding: '22px 28px',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.55',
                  textAlign: 'justify',
                  color: '#1a1a1a',
                  margin: '0 0 16px',
                }}
              >
                {card.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: COLORS.btnBg,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 0',
                    cursor: 'pointer',
                    width: '220px',
                    letterSpacing: '0.01em',
                  }}
                >
                  {card.label}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: COLORS.btnBg,
              border: 'none',
              borderRadius: '6px',
              padding: '14px 0',
              width: '100%',
              maxWidth: '440px',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Volver a Inicio
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
