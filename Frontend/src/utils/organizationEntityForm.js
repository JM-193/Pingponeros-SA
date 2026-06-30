import { SOLO_LETRAS_PUNTUACION_REGEX } from '../constants/regex'

// Campos de texto libre que solo admiten letras, espacios y puntuación básica (. , :).
const CAMPOS_SOLO_TEXTO = ['nombre', 'descripcion']

// Elimina, al escribir/pegar, los caracteres no permitidos por SOLO_LETRAS_PUNTUACION_REGEX.
const CARACTERES_INVALIDOS = /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ.,:\s]/g

const MENSAJE_NOMBRE = 'El nombre solo puede contener letras, números, espacios, puntos, comas y dos puntos'
const MENSAJE_DESCRIPCION = 'La descripción solo puede contener letras, números, espacios, puntos, comas y dos puntos'

export function createOrganizationEntityInputChangeHandler(setFormData, clearFeedback) {
  return (event) => {
    const { name, value } = event.target
    clearFeedback()
    const sanitized = CAMPOS_SOLO_TEXTO.includes(name) ? value.replace(CARACTERES_INVALIDOS, '') : value
    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
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
  } else if (!SOLO_LETRAS_PUNTUACION_REGEX.test(formData.nombre)) {
    errors.nombre = MENSAJE_NOMBRE
  }

  if (!formData.descripcion.trim()) {
    errors.descripcion = 'La descripción es requerida'
  } else if (!SOLO_LETRAS_PUNTUACION_REGEX.test(formData.descripcion)) {
    errors.descripcion = MENSAJE_DESCRIPCION
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
