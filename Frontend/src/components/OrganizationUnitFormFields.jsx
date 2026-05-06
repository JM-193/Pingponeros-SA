import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

function OrganizationUnitFormFields({ formData, onChange }) {
  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: COLORS.labelColor, fontSize: '14px', whiteSpace: 'nowrap' }}>
            Área de
          </span>
          <input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            required
            placeholder="Nombre del área"
            style={{
              flex: 1,
              padding: '10px',
              border: `1px solid ${COLORS.borderColor}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: COLORS.inputBg,
              color: '#000',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="descripcion"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            color: COLORS.labelColor,
            fontSize: '14px',
          }}
        >
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          required
          style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.borderColor}`,
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: COLORS.inputBg,
            color: '#000',
            fontFamily: 'inherit',
            minHeight: '100px',
            resize: 'vertical',
          }}
          placeholder="Ingrese la descripción del área"
        />
      </div>
    </>
  )
}

OrganizationUnitFormFields.propTypes = {
  formData: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
}

export default OrganizationUnitFormFields
