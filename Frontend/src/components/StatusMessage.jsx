import PropTypes from 'prop-types'

const VARIANT_CONFIG = {
  success: {
    icon: '\u2713',
    color: '#1b5e20',
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
  error: {
    icon: '\u26a0',
    color: '#b71c1c',
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
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
