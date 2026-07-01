import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

const VARIANT_STYLES = {
  primary: {
    bg: COLORS.primaryBtn,
    bgHover: COLORS.primaryBtnHover,
    color: COLORS.white,
    border: 'none',
  },
  secondary: {
    bg: COLORS.secondaryBtn,
    bgHover: COLORS.secondaryBtnHover,
    color: COLORS.white,
    border: 'none',
  },
  // Acción de contenido (no es la acción principal del flujo): borde azul sin relleno.
  outline: {
    bg: COLORS.white,
    bgHover: COLORS.surfaceHover,
    color: COLORS.primaryBtn,
    border: `1px solid ${COLORS.primaryBtn}`,
  },
  // Acción destructiva de baja prominencia: texto y borde rojo sin relleno hasta el hover.
  danger: {
    bg: 'transparent',
    bgHover: COLORS.errorSoftBg,
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}`,
  },
}

function FormButton({ label, type, variant, onClick, disabled, width }) {
  const { bg, bgHover, color, border } = VARIANT_STYLES[variant] ?? VARIANT_STYLES.secondary

  const isFilled = variant === 'primary' || variant === 'secondary'
  const isFilledBg = isFilled ? COLORS.disabledBg : 'transparent'
  const backgroundColor = disabled ? isFilledBg : bg
  const textColor = disabled ? COLORS.disabledColor : color

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 32px',
        width,
        backgroundColor,
        color: textColor,
        border,
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={(e) => !disabled && (e.target.style.backgroundColor = bgHover)}
      onMouseLeave={(e) => !disabled && (e.target.style.backgroundColor = backgroundColor)}
    >
      {label}
    </button>
  )
}

FormButton.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['submit', 'reset', 'button']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

FormButton.defaultProps = {
  type: 'submit',
  variant: 'primary',
  onClick: () => {},
  disabled: false,
  width: '100px',
}

export default FormButton
