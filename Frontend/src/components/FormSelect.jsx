import PropTypes from 'prop-types'
import Select from 'react-select'
import { COLORS } from '../constants/colors'
import { buildSelectStyles, selectTheme, menuPortalTarget } from '../utils/selectStyles'

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
  // react-select trabaja con objetos { value, label }; convertimos el valor
  // controlado (un id en forma de string) al objeto correspondiente.
  const selectedOption = options.find((option) => option.value === value) || null

  // Adaptamos el callback de react-select al contrato de evento sintético que
  // esperan los formularios consumidores (e.target.name / e.target.value).
  const handleChange = (selected) => {
    onChange({ target: { name, value: selected ? selected.value : '' } })
  }

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
      <Select
        inputId={id}
        name={name}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isDisabled={disabled}
        isClearable
        isSearchable
        placeholder={defaultLabel}
        noOptionsMessage={() => 'Sin resultados'}
        classNamePrefix="form-select"
        aria-invalid={error ? 'true' : undefined}
        aria-errormessage={error ? `${id}-error` : undefined}
        required={required}
        menuPortalTarget={menuPortalTarget}
        styles={buildSelectStyles({ error: Boolean(error) })}
        theme={selectTheme}
      />
      {error && (
        <span
          id={`${id}-error`}
          style={{ fontSize: '12px', color: COLORS.danger, marginTop: '6px', display: 'block' }}
        >
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
