import { Link } from 'react-router-dom'
import ucrLogo from '../assets/firma-tipografica-una-linea-blanco.png'
import ucrLogoMobile from '../assets/firma-horizontal-dos-lineas-reverso.png'
import vraLogo from '../assets/vrasgv/VRA_B-N_2.svg'
import { COLORS } from '../constants/colors'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function Header() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <header
        style={{
          backgroundColor: COLORS.headerBg,
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '10px',
        }}
      >
        <Link to="/home" style={{ display: 'inline-flex' }}>
          <img
            src={ucrLogoMobile}
            alt="Universidad de Costa Rica"
            style={{ height: '70px', objectFit: 'contain' }}
          />
        </Link>
        <Link to="/home" style={{ display: 'inline-flex' }}>
          <img
            src={vraLogo}
            alt="Vicerrectoría de Administración"
            style={{ height: '70px', objectFit: 'contain', maxWidth: '150px' }}
          />
        </Link>
      </header>
    )
  }
  return (
    <header
      style={{
        backgroundColor: COLORS.headerBg,
        padding: '10px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '20px',
      }}
    >
      <Link to="/home" style={{ display: 'inline-flex' }}>
        <img
          src={ucrLogo}
          alt="Universidad de Costa Rica"
          style={{ height: '55px', objectFit: 'contain' }}
        />
      </Link>
      <Link to="/home" style={{ display: 'inline-flex' }}>
        <img
          src={vraLogo}
          alt="Vicerrectoría de Administración"
          style={{ height: '55px', objectFit: 'contain', maxWidth: '220px' }}
        />
      </Link>
    </header>
  )
}
