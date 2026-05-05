import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function FormButton({ label, type, variant, onClick }) {
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

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: '12px 32px',
        backgroundColor: bg,
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = bgHover)}
      onMouseLeave={(e) => (e.target.style.backgroundColor = bg)}
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
}

FormButton.defaultProps = {
  type: 'submit',
  variant: 'primary',
  onClick: () => {},
}

export default FormButton
