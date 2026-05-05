import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function FormContainer({ children, onSubmit, title, subtitle }) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: COLORS.inputBg,
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {!!title && (
        <h1
          style={{
            fontWeight: 900,
            fontSize: 'clamp(22px, 2.5vw, 34px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
            margin: '0 0 10px',
            color: COLORS.labelColor,
          }}
        >
          {title}
        </h1>
      )}

      {!!subtitle && (
        <h2
          style={{
            fontWeight: 800,
            fontSize: 'clamp(14px, 1.8vw, 22px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
            margin: '0 0 28px',
            color: COLORS.labelColor,
          }}
        >
          {subtitle}
        </h2>
      )}

      {children}
    </form>
  )
}

FormContainer.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
}

FormContainer.defaultProps = {
  title: '',
  subtitle: '',
}

export default FormContainer
