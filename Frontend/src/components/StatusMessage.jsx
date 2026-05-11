import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

const VARIANT_CONFIG = {
  success: {
    icon: '\u2713',
    color: COLORS.successStrong,
    backgroundColor: COLORS.successSoftBg,
    borderColor: COLORS.successSoftBorder,
  },
  error: {
    icon: '\u26a0',
    color: COLORS.errorStrong,
    backgroundColor: COLORS.errorSoftBg,
    borderColor: COLORS.errorSoftBorder,
  },
}

function StatusMessage({ variant, message, children, style }) {
  const config = VARIANT_CONFIG[variant]

  return (
    <div
      style={{
        color: config.color,
        backgroundColor: config.backgroundColor,
        padding: '12px 16px',
        borderRadius: '6px',
        border: `1px solid ${config.borderColor}`,
        fontSize: '14px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
        <span>{config.icon}</span>
        <span>{message}</span>
      </div>
      {children && <div style={{ marginTop: '10px' }}>{children}</div>}
    </div>
  )
}

StatusMessage.propTypes = {
  variant: PropTypes.oneOf(['success', 'error']).isRequired,
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
  style: PropTypes.object,
}

StatusMessage.defaultProps = {
  children: null,
  style: {},
}

export default StatusMessage
