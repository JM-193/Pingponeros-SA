export function createOrganizationEntityInputChangeHandler(setFormData, clearFeedback) {
  return (event) => {
    const { name, value } = event.target
    clearFeedback()
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
}

export function getOrganizationEntityFormError(formData, options = {}) {
  const {
    entityLabel = 'área',
    nameArticle = 'del',
    requireArea = false,
    requireParent = false,
    parentType = '',
    parentErrors = {
      default: 'El departamento o sección es requerido',
      departamento: 'El departamento es requerido',
      seccion: 'La sección es requerida',
    },
  } = options

  if (!formData.nombre.trim()) {
    return `El nombre ${nameArticle} ${entityLabel} es requerido`
  }

  if (!formData.descripcion.trim()) {
    return 'La descripción es requerida'
  }

  if (requireArea && !formData.idArea) {
    return 'El área es requerida'
  }

  if (requireParent) {
    if (!parentType) {
      return parentErrors.default
    }

    if (parentType === 'departamento' && !formData.idDepartamento) {
      return parentErrors.departamento
    }

    if (parentType === 'seccion' && !formData.idSeccion) {
      return parentErrors.seccion
    }
  }

  return ''
}

export function getOrganizationEntityPayload(formData, options = {}) {
  const {
    includeEstado = true,
    includeArea = false,
    parentType = '',
  } = options

  const payload = {
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
  }

  if (includeEstado) {
    payload.estado = Number(formData.estado ?? 1)
  }

  if (includeArea && formData.idArea) {
    payload.idArea = Number(formData.idArea)
  }

  if (parentType === 'departamento' && formData.idDepartamento) {
    payload.idDepartamento = Number(formData.idDepartamento)
  }

  if (parentType === 'seccion' && formData.idSeccion) {
    payload.idSeccion = Number(formData.idSeccion)
  }

  return payload
}
