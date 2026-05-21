// StateToggle.jsx
import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function StateToggle({ currentState, onStateChange, disabled }) {
  const states = [
    { value: 1, label: 'Activo' },
    { value: 0, label: 'Inactivo' },
  ]

  const getBorderRadius = (isFirst, isLast) => {
    if (isFirst) return '6px 0 0 6px'
    if (isLast) return '0 6px 6px 0'
    return '0'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '0 0 28px',
        padding: '0',
      }}
    >
      <span style={{ color: COLORS.textMuted, fontSize: '15px', fontWeight: 500, margin: 0 }}>
        Estado actual:
      </span>
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderRadius: '8px',
          backgroundColor: COLORS.surfaceMuted,
          padding: '4px',
          width: 'fit-content',
        }}
        role="radiogroup"
        aria-label="Estado del área"
      >
        {states.map((state, index) => {
          const isActive = currentState === state.value
          const isFirst = index === 0
          const isLast = index === states.length - 1

          return (
            <button
              key={state.value}
              onClick={() => !disabled && onStateChange(state.value)}
              disabled={disabled}
              type="button"
              style={{
                padding: '10px 28px',
                backgroundColor: isActive ? COLORS.white : 'transparent',
                color: isActive ? COLORS.textDark : COLORS.textMuted,
                border: 'none',
                borderRadius: getBorderRadius(isFirst, isLast),
                fontSize: '15px',
                fontWeight: isActive ? 700 : 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: disabled ? 0.5 : 1,
                boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                userSelect: 'none',
                letterSpacing: '0.3px',
                flex: '0 1 auto',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isActive) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent'
                }
              }}
            >
              {state.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

StateToggle.propTypes = {
  currentState: PropTypes.number.isRequired,
  onStateChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

StateToggle.defaultProps = {
  disabled: false,
}

export default StateToggle
