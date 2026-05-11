import ucrLogo from '../assets/firma-tipografica-una-linea-blanco.png'
import { COLORS } from '../constants/colors'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: COLORS.footerBg, color: COLORS.white, padding: '28px 40px' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '28px',
        }}
      >
        {/* Columna izquierda: logo, redes y copyright */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
          <img
            src={ucrLogo}
            alt="Universidad de Costa Rica"
            style={{
              height: '35px',
              display: 'block',
              alignSelf: 'flex-start',
              marginLeft: '-6px',
            }}
          />
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {/* Instagram */}
            <a href="https://www.instagram.com/universidaddecostarica/" target="_blank" rel="noopener noreferrer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={COLORS.white} aria-label="Instagram">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/UniversidadCostaRica" target="_blank" rel="noopener noreferrer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={COLORS.white} aria-label="Facebook">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            </a>
          </div>
          <p style={{ fontSize: '11px', color: COLORS.textLight, margin: 0 }}>
            © Escuela de Ciencias de la Computación e Informática, 2026.
          </p>
        </div>

        {/* Columna central: Contacto */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 10px' }}>
            Contacto
          </p>
          <p style={{ fontSize: '13px', margin: '0 0 4px', color: COLORS.borderColor }}>
            +506 2222-4040
          </p>
          <p style={{ fontSize: '13px', margin: 0, color: COLORS.borderColor }}>
            ecci@ucr.ac.cr
          </p>
        </div>

        {/* Columna derecha - Enlaces rápidos */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 10px' }}>
            Enlaces rápidos
          </p>
          <a href="https://portal.ucr.ac.cr/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: COLORS.borderColor, fontSize: '13px', textDecoration: 'none', marginBottom: '6px' }}>
            Portal UCR
          </a>
          <a href="https://ematricula.ucr.ac.cr/ematricula" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: COLORS.borderColor, fontSize: '13px', textDecoration: 'none', marginBottom: '6px' }}>
            Matrícula Web
          </a>
          <a href="https://soporteci.ucr.ac.cr/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: COLORS.borderColor, fontSize: '13px', textDecoration: 'none' }}>
            Soporte Técnico
          </a>
        </div>
      </div>
    </footer>
  )
}
