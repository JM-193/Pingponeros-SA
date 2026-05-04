import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

/* UCR brand palette 
   Azul UCR  #00AEEF  (Pantone 299 C)
   Azul oscuro institucional  #1D4F91
   Footer   #2D2F34
   Fondo     #e9e9e9
*/

const COLORS = {
  bodyBg: '#e9e9e9',
  navBg: '#1D4F91',
  navBtn: '#00AEEF',
}

const NAV_ITEMS = [
  { label: 'Página Principal', path: '/home', active: true },
  { label: 'Declaraciones', path: '/home' },
  { label: 'Consultas', path: '/home' },
  { label: 'Usuarios', path: '/usuarios' },
  { label: 'Organización', path: '/organizacion' },
  { label: 'Funciones', path: '/home' },
]

const DECLARATIONS = [
  { id: 12, date: '03/04/26' },
  { id: 11, date: '03/04/26' },
  { id: 10, date: '03/03/26' },
]

export default function Home() {
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
          {/* Circle with person icon */}
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
          {/* Dropdown arrow */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M7 10l5 5 5-5z" />
          </svg>

          {/* Dropdown menu */}
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

        {/* Page title */}
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
            margin: '0 0 28px',
            color: '#1a1a1a',
          }}
        >
          La Aplicación de Cargas de Trabajo
        </h2>

        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'justify',
            maxWidth: '820px',
            margin: '0 auto 36px',
            color: '#333',
          }}
        >
          La herramienta para la aplicación de cargas de trabajo, tiene por objetivo recopilar
          información que permita conocer el volumen, distribución y organización del trabajo.
          Sus respuestas verdaderas y precisas servirán de referencia para valorar las necesidades
          planteadas por su Unidad de Trabajo. Las respuestas brindadas serán contrastadas con
          la matriz de procesos de la Unidad respectiva, así como los formularios generales de
          puesto. Se agradece el tiempo y disposición para analizar y responder las preguntas
          que se le indican.
        </p>

        {/* Declaraciones section */}
        <h3
          style={{
            fontWeight: 700,
            fontSize: 'clamp(15px, 1.5vw, 20px)',
            textAlign: 'center',
            margin: '0 0 20px',
            color: '#1a1a1a',
          }}
        >
          Declaraciones Jurada del Puesto de Trabajo
        </h3>

        {/* Historial box */}
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            backgroundColor: '#d9d9d9',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h4
            style={{
              fontWeight: 700,
              fontSize: '15px',
              textAlign: 'center',
              margin: '0 0 18px',
              color: '#1a1a1a',
            }}
          >
            Historial de Declaraciones Juradas
          </h4>

          {/* Declaration cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DECLARATIONS.map((decl) => (
              <button
                key={decl.id}
                onClick={() => {}} // Handle click
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // Handle card interaction
                  }
                }}
                tabIndex={0}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    margin: '0 0 6px',
                    color: '#1a1a1a',
                  }}
                >
                  Declaración #{decl.id}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    margin: '0 0 4px',
                    color: '#555',
                  }}
                >
                  Fecha guardado: {decl.date}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    margin: 0,
                    color: '#888',
                  }}
                >
                  ...
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
