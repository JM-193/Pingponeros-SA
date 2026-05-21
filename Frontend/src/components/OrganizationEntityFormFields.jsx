import PropTypes from 'prop-types'
import FormRow from './FormRow'
import FormSelect from './FormSelect'
import { COLORS } from '../constants/colors'

export default function OrganizationEntityFormFields({
  formData,
  onChange,
  namePrefix,
  namePlaceholder,
  descriptionPlaceholder,
  areaOptions,
  areaLabel = 'Área',
  areaRequired = false,
  areaDefaultLabel = 'Seleccione un área',
  parentType = '',
  parentTypeOptions,
  onParentTypeChange = () => {},
  parentTypeLabel = 'Tipo de dependencia',
  parentTypeDefaultLabel = 'Seleccione un tipo',
  departmentOptions = [],
  sectionOptions = [],
  parentRequired = false,
  departmentLabel = 'Departamento',
  sectionLabel = 'Sección',
  departmentDefaultLabel = 'Seleccione un departamento',
  sectionDefaultLabel = 'Seleccione una sección',
}) {
  const shouldShowArea = Array.isArray(areaOptions)
  const shouldShowParentType = Array.isArray(parentTypeOptions)

  const areaSelect = shouldShowArea ? (
    <FormSelect
      label={areaLabel}
      id="idArea"
      name="idArea"
      value={formData.idArea}
      onChange={onChange}
      options={areaOptions}
      required={areaRequired}
      defaultLabel={areaDefaultLabel}
    />
  ) : null

  const parentTypeSelect = shouldShowParentType ? (
    <FormSelect
      label={parentTypeLabel}
      id="parentType"
      name="parentType"
      value={parentType}
      onChange={onParentTypeChange}
      options={parentTypeOptions}
      required={parentRequired}
      defaultLabel={parentTypeDefaultLabel}
    />
  ) : null

  const showDepartmentSelect = parentType === 'departamento'
  const showSectionSelect = parentType === 'seccion'

  return (
    <>
      {shouldShowArea && shouldShowParentType ? (
        <FormRow columns={2}>
          {areaSelect}
          {parentTypeSelect}
        </FormRow>
      ) : (
        <>
          {areaSelect}
          {parentTypeSelect}
        </>
      )}

      {showDepartmentSelect && (
        <FormSelect
          label={departmentLabel}
          id="idDepartamento"
          name="idDepartamento"
          value={formData.idDepartamento}
          onChange={onChange}
          options={departmentOptions}
          required={parentRequired}
          defaultLabel={departmentDefaultLabel}
        />
      )}

      {showSectionSelect && (
        <FormSelect
          label={sectionLabel}
          id="idSeccion"
          name="idSeccion"
          value={formData.idSeccion}
          onChange={onChange}
          options={sectionOptions}
          required={parentRequired}
          defaultLabel={sectionDefaultLabel}
        />
      )}

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: COLORS.labelColor, fontSize: '14px', whiteSpace: 'nowrap' }}>
            {namePrefix}
          </span>
          <input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            required
            placeholder={namePlaceholder}
            style={{
              flex: 1,
              padding: '10px',
              border: `1px solid ${COLORS.borderColor}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: COLORS.inputBg,
              color: COLORS.black,
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
            color: COLORS.black,
            fontFamily: 'inherit',
            minHeight: '100px',
            resize: 'vertical',
          }}
          placeholder={descriptionPlaceholder}
        />
      </div>
    </>
  )
}

OrganizationEntityFormFields.propTypes = {
  formData: PropTypes.shape({
    idArea: PropTypes.string,
    idDepartamento: PropTypes.string,
    idSeccion: PropTypes.string,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  namePrefix: PropTypes.string.isRequired,
  namePlaceholder: PropTypes.string.isRequired,
  descriptionPlaceholder: PropTypes.string.isRequired,
  areaOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  areaLabel: PropTypes.string,
  areaRequired: PropTypes.bool,
  areaDefaultLabel: PropTypes.string,
  parentType: PropTypes.string,
  parentTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onParentTypeChange: PropTypes.func,
  parentTypeLabel: PropTypes.string,
  parentTypeDefaultLabel: PropTypes.string,
  departmentOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  sectionOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  parentRequired: PropTypes.bool,
  departmentLabel: PropTypes.string,
  sectionLabel: PropTypes.string,
  departmentDefaultLabel: PropTypes.string,
  sectionDefaultLabel: PropTypes.string,
}

OrganizationEntityFormFields.defaultProps = {
  areaOptions: null,
  parentTypeOptions: null,
}
