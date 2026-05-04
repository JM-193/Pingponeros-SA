import ucrLogo from '../assets/firma-tipografica-una-linea-blanco.png'
import vraLogo from '../assets/vrasgv/VRA_B-N_2.svg'

const HEADER_BG = '#00AEEF'

export default function Header() {
  return (
    <header
      style={{
        backgroundColor: HEADER_BG,
        padding: '10px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '20px',
      }}
    >
      <img
        src={ucrLogo}
        alt="Universidad de Costa Rica"
        style={{ height: '55px', objectFit: 'contain' }}
      />
      <img
        src={vraLogo}
        alt="Vicerrectoría de Administración"
        style={{ height: '75px', objectFit: 'contain', maxWidth: '220px' }}
      />
    </header>
  )
}
