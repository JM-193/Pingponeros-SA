import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function FormButton({ label, type, variant, onClick, disabled }) {
  const getStylesByVariant = () => {
    if (variant === 'primary') {
      return {
        bg: COLORS.primaryBtn,
        bgHover: COLORS.primaryBtnHover,
      }
    }
    return {
      bg: COLORS.secondaryBtn,
      bgHover: COLORS.secondaryBtnHover,
    }
  }

  const { bg, bgHover } = getStylesByVariant()

  const backgroundColor = disabled ? COLORS.disabledBg : bg
  const textColor = disabled ? COLORS.disabledColor : '#fff'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 32px',
        backgroundColor,
        color: textColor,
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={(e) => !disabled && (e.target.style.backgroundColor = bgHover)}
      onMouseLeave={(e) => !disabled && (e.target.style.backgroundColor = bg)}
    >
      {label}
    </button>
  )
}

FormButton.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['submit', 'reset', 'button']),
  variant: PropTypes.oneOf(['primary', 'secondary']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

FormButton.defaultProps = {
  type: 'submit',
  variant: 'primary',
  onClick: () => {},
  disabled: false,
}

export default FormButton
