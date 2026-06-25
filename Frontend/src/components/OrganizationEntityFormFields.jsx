import PropTypes from 'prop-types'
import FormRow from './FormRow'
import FormSelect from './FormSelect'
import { COLORS } from '../constants/colors'

export default function OrganizationEntityFormFields({
  formData,
  onChange,
  errors = {},
  namePrefix,
  namePlaceholder,
  descriptionPlaceholder,
  nameLabel,
  descriptionLabel = 'Descripción',
  areaOptions,
  areaLabel = 'Área',
  areaRequired = false,
  areaDefaultLabel = '-- Sin asignación --',
  parentType = '',
  parentTypeOptions,
  onParentTypeChange = () => {},
  parentTypeLabel = 'Tipo de dependencia',
  parentTypeDefaultLabel = '-- Sin asignación --',
  departmentOptions = [],
  sectionOptions = [],
  parentRequired = false,
  departmentLabel = 'Departamento',
  sectionLabel = 'Sección',
  departmentDefaultLabel = '-- Sin asignación --',
  sectionDefaultLabel = '-- Sin asignación --',
}) {
  const shouldShowArea = Array.isArray(areaOptions)
  const shouldShowParentType = Array.isArray(parentTypeOptions)
  const resolvedNameLabel = nameLabel ?? namePrefix

  const fieldErrorStyle = { fontSize: '12px', color: COLORS.danger, marginTop: '6px', display: 'block' }

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
      error={errors.idArea}
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
      error={errors.parentType}
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
          error={errors.idDepartamento}
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
          error={errors.idSeccion}
        />
      )}

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="nombre"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            color: COLORS.labelColor,
            fontSize: '14px',
          }}
        >
          {resolvedNameLabel}
          <span style={{ color: COLORS.danger, marginLeft: '2px' }} aria-hidden="true">*</span>
        </label>
        <input
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          required
          placeholder={namePlaceholder}
          aria-invalid={errors.nombre ? 'true' : undefined}
          style={{
            width: '100%',
            padding: '10px',
            border: errors.nombre ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderColor}`,
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: COLORS.inputBg,
            color: COLORS.black,
          }}
          maxLength={50}
        />
        {errors.nombre && <span style={fieldErrorStyle}>{errors.nombre}</span>}
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
          {descriptionLabel}
          <span style={{ color: COLORS.danger, marginLeft: '2px' }} aria-hidden="true">*</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          required
          aria-invalid={errors.descripcion ? 'true' : undefined}
          style={{
            width: '100%',
            padding: '10px',
            border: errors.descripcion ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderColor}`,
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: COLORS.inputBg,
            color: COLORS.black,
            fontFamily: 'inherit',
            minHeight: '100px',
            resize: 'vertical',
          }}
          maxLength={2048}
          placeholder={descriptionPlaceholder}
        />
        {errors.descripcion && <span style={fieldErrorStyle}>{errors.descripcion}</span>}
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
  errors: PropTypes.object,
  namePrefix: PropTypes.string.isRequired,
  namePlaceholder: PropTypes.string.isRequired,
  descriptionPlaceholder: PropTypes.string.isRequired,
  nameLabel: PropTypes.string,
  descriptionLabel: PropTypes.string,
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
  nameLabel: undefined,
  descriptionLabel: 'Descripción',
}
