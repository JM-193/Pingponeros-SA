import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

/**
 * Tarjeta de indicador del panel: un valor numérico grande con su etiqueta y un ícono con color
 * de acento. Es puramente presentacional; el valor ya viene calculado desde el backend.
 */
export default function StatCard({ label, value, icon, accent, hint }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: COLORS.white,
        borderRadius: '10px',
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '46px',
          height: '46px',
          flexShrink: 0,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          backgroundColor: `${accent}1a`,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '26px',
            fontWeight: 800,
            lineHeight: 1.1,
            color: COLORS.textDark,
          }}
        >
          {value}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '13px',
            fontWeight: 600,
            color: COLORS.textMuted,
          }}
        >
          {label}
        </p>
        {hint && (
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.textLight }}>
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  accent: PropTypes.string,
  hint: PropTypes.string,
}

StatCard.defaultProps = {
  icon: null,
  accent: COLORS.primaryBtn,
  hint: undefined,
}
