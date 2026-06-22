import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function FormInput({
  label,
  id,
  name,
  value,
  onChange,
  type,
  required,
  placeholder,
  disabled,
  maxLength,
  error,
  style,
}) {
  const isDisabledBorder = disabled ? COLORS.borderDisabled : COLORS.borderColor

  return (
    <div style={{ marginBottom: '20px', ...style }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 600,
          color: COLORS.labelColor,
          fontSize: '14px',
        }}
      >
        {label}
        {required && <span style={{ color: COLORS.danger, marginLeft: '2px' }} aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : undefined}
        style={{
          width: '100%',
          padding: '10px',
          border: error
            ? `2px solid ${COLORS.danger}`
            : `1px solid ${isDisabledBorder}`,
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: disabled ? COLORS.disabledBg : COLORS.inputBg,
          color: disabled ? COLORS.disabledColor : COLORS.black,
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.7 : 1,
        }}
      />
      {error && (
        <span style={{ fontSize: '12px', color: COLORS.danger, marginTop: '6px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  error: PropTypes.string,
  style: PropTypes.object,
}

FormInput.defaultProps = {
  type: 'text',
  required: false,
  placeholder: '',
  disabled: false,
  error: '',
}

export default FormInput
