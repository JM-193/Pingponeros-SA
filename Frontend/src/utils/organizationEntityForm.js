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

/**
 * Valida un formulario de entidad organizacional y devuelve un objeto de errores
 * por campo (`{ nombre?, descripcion?, idArea?, parentType?, idDepartamento?, idSeccion? }`).
 * Un objeto vacío significa que el formulario es válido. Se reportan todos los
 * campos inválidos a la vez para mostrarlos en línea bajo cada control.
 */
export function getOrganizationEntityFormErrors(formData, options = {}) {
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

  const errors = {}

  if (!formData.nombre.trim()) {
    errors.nombre = `El nombre ${nameArticle} ${entityLabel} es requerido`
  }

  if (!formData.descripcion.trim()) {
    errors.descripcion = 'La descripción es requerida'
  }

  if (requireArea && !formData.idArea) {
    errors.idArea = 'El área es requerida'
  }

  if (requireParent) {
    if (!parentType) {
      errors.parentType = parentErrors.default
    } else if (parentType === 'departamento' && !formData.idDepartamento) {
      errors.idDepartamento = parentErrors.departamento
    } else if (parentType === 'seccion' && !formData.idSeccion) {
      errors.idSeccion = parentErrors.seccion
    }
  }

  return errors
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
