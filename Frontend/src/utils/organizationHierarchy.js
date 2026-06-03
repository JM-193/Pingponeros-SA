export const PLAZA_HIERARCHY_CONFLICT_MESSAGES = {
  departamentoArea:
    'El departamento seleccionado no pertenece al área elegida. Seleccione un departamento válido.',
  seccionArea:
    'La sección seleccionada no pertenece al área elegida. Seleccione una sección válida.',
  unidadArea:
    'La unidad seleccionada no pertenece al área elegida. Seleccione una unidad válida.',
  unidadDepartamento:
    'La unidad seleccionada no pertenece al departamento elegido. Seleccione una unidad válida.',
  unidadSeccion:
    'La unidad seleccionada no pertenece a la sección elegida. Seleccione una unidad válida.',
}

export function toFormValue(value) {
  return value == null ? '' : String(value)
}

export function getEntityId(entity, idField) {
  return entity?.id ?? entity?.[idField]
}

export function findEntityById(items, value, idField) {
  if (!value) return null
  return items.find((item) => toFormValue(getEntityId(item, idField)) === String(value)) ?? null
}

export function getEntityAreaValue(entity) {
  return toFormValue(entity?.idArea)
}

export function getUnidadParentData(unidad) {
  if (unidad?.idDepartamento != null) {
    return {
      parentType: 'departamento',
      idDepartamento: toFormValue(unidad.idDepartamento),
      idSeccion: '',
    }
  }

  if (unidad?.idSeccion != null) {
    return {
      parentType: 'seccion',
      idDepartamento: '',
      idSeccion: toFormValue(unidad.idSeccion),
    }
  }

  return {
    parentType: '',
    idDepartamento: '',
    idSeccion: '',
  }
}

export function applyAreaFromEntity(formData, entity) {
  const idArea = getEntityAreaValue(entity)
  return idArea ? { ...formData, idArea } : formData
}

export function getUnidadAreaValue(unidad, { rawDepartamentos = [], rawSecciones = [] } = {}) {
  const ownArea = getEntityAreaValue(unidad)
  if (ownArea) return ownArea

  const parent = getUnidadParentData(unidad)
  if (parent.parentType === 'departamento') {
    return getEntityAreaValue(findEntityById(rawDepartamentos, parent.idDepartamento, 'idDepartamento'))
  }

  if (parent.parentType === 'seccion') {
    return getEntityAreaValue(findEntityById(rawSecciones, parent.idSeccion, 'idSeccion'))
  }

  return ''
}

export function isUnidadInArea(unidad, areaValue, options = {}) {
  if (!areaValue) return true
  return getUnidadAreaValue(unidad, options) === String(areaValue)
}

function clearConflictingField({ formData, areaValue, items, idField, message, getAreaValue = getEntityAreaValue }) {
  const selectedEntity = findEntityById(items, formData[idField], idField)
  const selectedArea = getAreaValue(selectedEntity)

  if (selectedArea && selectedArea !== areaValue) {
    return {
      formData: { ...formData, [idField]: '' },
      conflict: message,
    }
  }

  return { formData, conflict: '' }
}

export function clearAreaConflicts({
  formData,
  areaValue,
  rawDepartamentos = [],
  rawSecciones = [],
  rawUnidades = [],
  includeUnidad = false,
  messages = PLAZA_HIERARCHY_CONFLICT_MESSAGES,
}) {
  if (!areaValue) return { formData, conflict: '' }

  const checks = [
    {
      enabled: Boolean(formData.idDepartamento),
      items: rawDepartamentos,
      idField: 'idDepartamento',
      message: messages.departamentoArea,
    },
    {
      enabled: Boolean(formData.idSeccion),
      items: rawSecciones,
      idField: 'idSeccion',
      message: messages.seccionArea,
    },
    {
      enabled: includeUnidad && Boolean(formData.idUnidad),
      items: rawUnidades,
      idField: 'idUnidad',
      message: messages.unidadArea,
      getAreaValue: (unidad) => getUnidadAreaValue(unidad, { rawDepartamentos, rawSecciones }),
    },
  ]

  return checks.reduce(
    (result, check) => {
      if (!check.enabled) return result

      const next = clearConflictingField({
        formData: result.formData,
        areaValue,
        items: check.items,
        idField: check.idField,
        message: check.message,
        getAreaValue: check.getAreaValue,
      })

      return {
        formData: next.formData,
        conflict: result.conflict || next.conflict,
      }
    },
    { formData, conflict: '' },
  )
}

export function resolveUnidadDependencyChange({
  formData,
  parentType,
  name,
  value,
  rawDepartamentos = [],
  rawSecciones = [],
}) {
  const nextData = {
    ...formData,
    [name]: value,
  }

  if (name === 'idDepartamento' && parentType === 'departamento') {
    return applyAreaFromEntity(nextData, findEntityById(rawDepartamentos, value, 'idDepartamento'))
  }

  if (name === 'idSeccion' && parentType === 'seccion') {
    return applyAreaFromEntity(nextData, findEntityById(rawSecciones, value, 'idSeccion'))
  }

  return nextData
}

function resolveAreaChange({ formData, value, rawDepartamentos, rawSecciones, rawUnidades, messages }) {
  const result = clearAreaConflicts({
    formData: { ...formData, idArea: value },
    areaValue: value,
    rawDepartamentos,
    rawSecciones,
    rawUnidades,
    includeUnidad: true,
    messages,
  })
  return { formData: result.formData, parentType: undefined, conflict: result.conflict }
}

function resolveDepartamentoChange({ formData, value, rawDepartamentos, rawUnidades, messages }) {
  const departamento = findEntityById(rawDepartamentos, value, 'idDepartamento')
  let nextData = applyAreaFromEntity(
    { ...formData, idDepartamento: value, idSeccion: value ? '' : formData.idSeccion },
    departamento,
  )

  let conflict = ''
  const unidad = findEntityById(rawUnidades, formData.idUnidad, 'idUnidad')
  if (value && unidad?.idDepartamento != null && toFormValue(unidad.idDepartamento) !== value) {
    nextData = { ...nextData, idUnidad: '' }
    conflict = messages.unidadDepartamento
  }

  return { formData: nextData, parentType: value ? 'departamento' : undefined, conflict }
}

function resolveSeccionChange({ formData, value, rawSecciones, rawUnidades, messages }) {
  const seccion = findEntityById(rawSecciones, value, 'idSeccion')
  let nextData = applyAreaFromEntity(
    { ...formData, idSeccion: value, idDepartamento: value ? '' : formData.idDepartamento },
    seccion,
  )

  let conflict = ''
  const unidad = findEntityById(rawUnidades, formData.idUnidad, 'idUnidad')
  if (value && unidad?.idSeccion != null && toFormValue(unidad.idSeccion) !== value) {
    nextData = { ...nextData, idUnidad: '' }
    conflict = messages.unidadSeccion
  }

  return { formData: nextData, parentType: value ? 'seccion' : undefined, conflict }
}

function resolveUnidadChange({ formData, value, rawDepartamentos, rawSecciones, rawUnidades }) {
  const unidad = findEntityById(rawUnidades, value, 'idUnidad')
  let nextData = applyAreaFromEntity({ ...formData, idUnidad: value }, unidad)

  if (!value || !unidad) {
    return { formData: nextData, parentType: undefined, conflict: '' }
  }

  const unidadParent = getUnidadParentData(unidad)
  nextData = { ...nextData, idDepartamento: unidadParent.idDepartamento, idSeccion: unidadParent.idSeccion }

  if (unidadParent.parentType === 'departamento') {
    nextData = applyAreaFromEntity(
      nextData,
      findEntityById(rawDepartamentos, unidadParent.idDepartamento, 'idDepartamento'),
    )
  } else if (unidadParent.parentType === 'seccion') {
    nextData = applyAreaFromEntity(
      nextData,
      findEntityById(rawSecciones, unidadParent.idSeccion, 'idSeccion'),
    )
  }

  return { formData: nextData, parentType: unidadParent.parentType, conflict: '' }
}

const FIELD_HANDLERS = {
  idArea: resolveAreaChange,
  idDepartamento: resolveDepartamentoChange,
  idSeccion: resolveSeccionChange,
  idUnidad: resolveUnidadChange,
}

export function resolvePlazaFieldChange({
  formData,
  name,
  value,
  rawDepartamentos = [],
  rawSecciones = [],
  rawUnidades = [],
  messages = PLAZA_HIERARCHY_CONFLICT_MESSAGES,
}) {
  const handler = FIELD_HANDLERS[name]
  if (!handler) {
    return { formData: { ...formData, [name]: value }, parentType: undefined, conflict: '' }
  }

  return handler({ formData, value, rawDepartamentos, rawSecciones, rawUnidades, messages })
}

