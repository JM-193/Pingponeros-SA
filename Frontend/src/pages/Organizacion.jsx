import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const COLORS = {
  bodyBg: '#e9e9e9',
  navBg: '#1D4F91',
  navBtn: '#00AEEF',
  btnBg: '#1D4F91',
}

const NAV_ITEMS = [
  { label: 'Página Principal', path: '/home' },
  { label: 'Declaraciones', path: '/organizacion' },
  { label: 'Consultas', path: '/organizacion' },
  { label: 'Usuarios', path: '/usuarios' },
  { label: 'Organización', path: '/organizacion', active: true },
  { label: 'Funciones', path: '/organizacion' },
]

const ACTION_CARDS = [
  {
    description: 'En este apartado puede gestionar las áreas de la universidad.',
    label: 'Áreas',
  },
  {
    description: 'En este apartado puede gestionar los departamentos de la universidad.',
    label: 'Departamentos',
  },
  {
    description: 'En este apartado puede gestionar las secciones de la universidad',
    label: 'Secciones',
  },
  {
    description: 'En este apartado puede gestionar las unidades de la universidad',
    label: 'Unidades',
  },
]

export default function Organizacion() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>

      {/* Header */}
      <Header />

      {/* Navbar */}
      <nav
        style={{
          backgroundColor: COLORS.navBg,
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Nav buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: item.active ? COLORS.navBtn : 'transparent',
                border: item.active ? 'none' : '1px solid rgba(255,255,255,0.35)',
                borderRadius: '20px',
                padding: '7px 18px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!item.active) e.currentTarget.style.backgroundColor = 'rgba(0,174,239,0.25)'
              }}
              onMouseLeave={(e) => {
                if (!item.active) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* User icon */}
        <button
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          onClick={() => setMenuOpen(!menuOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setMenuOpen(!menuOpen)
            }
          }}
          aria-label="User menu"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M7 10l5 5 5-5z" />
          </svg>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                backgroundColor: '#fff',
                borderRadius: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                minWidth: '160px',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <button
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  color: '#333',
                  cursor: 'pointer',
                }}
              >
                Mi Perfil
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  borderTop: '1px solid #eee',
                  background: 'none',
                  fontSize: '13px',
                  color: '#d10f0f',
                  cursor: 'pointer',
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </button>
      </nav>

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
          Gestión de Organización
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
