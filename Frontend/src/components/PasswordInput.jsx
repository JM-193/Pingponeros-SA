import { useState } from 'react'
import PropTypes from 'prop-types'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { COLORS } from '../constants/colors'

function PasswordInput({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  maxlength,
}) {
  const [showPassword, setShowPassword] = useState(false)

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
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxlength || 30}
          style={{
            width: '100%',
            padding: '14px 18px 14px 18px',
            paddingRight: '40px',
            border: error ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderLight}`,
            borderRadius: '4px',
            fontSize: '15px',
            backgroundColor: COLORS.white,
            outline: 'none',
            color: COLORS.textDark,
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.7 : 1,
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: COLORS.textMuted,
            display: 'flex',
            alignItems: 'center',
            padding: '0',
          }}
        >
          {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: COLORS.danger, marginTop: '6px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

PasswordInput.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
}

PasswordInput.defaultProps = {
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
}

export default PasswordInput
