export function createOrganizationUnitInputChangeHandler(setFormData, clearFeedback) {
  return (event) => {
    const { name, value } = event.target
    clearFeedback()
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
}

export function getOrganizationUnitFormError(formData) {
  if (!formData.nombre.trim()) {
    return 'El nombre del área es requerido'
  }

  if (!formData.descripcion.trim()) {
    return 'La descripción es requerida'
  }

  return ''
}

export function getOrganizationUnitPayload(formData) {
  return {
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
  }
}
