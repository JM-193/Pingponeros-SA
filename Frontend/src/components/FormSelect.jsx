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
}) {
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
        {required && ' *'}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '10px',
          border: `1px solid ${COLORS.borderColor}`,
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: COLORS.inputBg,
          cursor: 'pointer',
        }}
      >
        <option value="">{defaultLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
}

FormSelect.defaultProps = {
  options: [],
  required: false,
  defaultLabel: 'Selecciona una opción',
}

export default FormSelect
