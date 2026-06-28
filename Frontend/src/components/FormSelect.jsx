import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function FormSelect({
  label,
  id,
  name,
  value,
  onChange,
  options,
  required,
  defaultLabel,
  disabled,
  error,
}) {
  const borderColor = disabled ? COLORS.borderDisabled : COLORS.borderColor

  return (
    <div style={{ marginBottom: '20px' }}>
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
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        style={{
          width: '100%',
          padding: '10px',
          border: error ? `2px solid ${COLORS.danger}` : `1px solid ${borderColor}`,
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: disabled ? COLORS.disabledBg : COLORS.inputBg,
          color: disabled ? COLORS.disabledColor : COLORS.black,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <option value="">{defaultLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '12px', color: COLORS.danger, marginTop: '6px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

FormSelect.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  required: PropTypes.bool,
  defaultLabel: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
}

FormSelect.defaultProps = {
  options: [],
  required: false,
  defaultLabel: 'Selecciona una opción',
  disabled: false,
  error: '',
}

export default FormSelect
