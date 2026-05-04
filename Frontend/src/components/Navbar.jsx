import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const COLORS = {
  navBg: '#1D4F91',
  navBtn: '#00AEEF',
}

const NAV_ITEMS = [
  { label: 'P\u00e1gina Principal', path: '/home', activeOn: '/home' },
  // { label: 'Declaraciones', path: '/declaraciones', activeOn: '/declaraciones' },
  // { label: 'Consultas', path: '/consultas', activeOn: '/consultas' },
  { label: 'Usuarios', path: '/usuarios', activeOn: '/usuarios' },
  { label: 'Organizaci\u00f3n', path: '/organizacion', activeOn: '/organizacion' },
  // { label: 'Funciones', path: '/funciones', activeOn: '/funciones' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.activeOn === location.pathname

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path) navigate(item.path)
              }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: isActive ? COLORS.navBtn : 'transparent',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.35)',
                borderRadius: '20px',
                padding: '7px 18px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0,174,239,0.25)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>

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
  )
}
