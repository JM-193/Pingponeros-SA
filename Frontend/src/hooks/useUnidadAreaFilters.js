import { useCallback, useMemo, useState } from 'react'

export function useUnidadAreaFilters({
  formData,
  setFormData,
  parentType,
  setParentType,
  departmentOptions,
  sectionOptions,
  rawDepartamentos,
  rawSecciones,
  clearFeedback,
  handleInputChange,
}) {
  const [conflictError, setConflictError] = useState('')

  const clearConflictError = useCallback(() => setConflictError(''), [])

  const filteredDepartmentOptions = useMemo(() => {
    if (!formData.idArea) return departmentOptions
    return rawDepartamentos
      .filter((d) => String(d.idArea) === String(formData.idArea))
      .map((d) => ({ value: String(d.id ?? d.idDepartamento), label: `Departamento de ${d.nombre}` }))
  }, [formData.idArea, rawDepartamentos, departmentOptions])

  const filteredSectionOptions = useMemo(() => {
    if (!formData.idArea) return sectionOptions
    return rawSecciones
      .filter((s) => String(s.idArea) === String(formData.idArea))
      .map((s) => ({ value: String(s.id ?? s.idSeccion), label: `Sección de ${s.nombre}` }))
  }, [formData.idArea, rawSecciones, sectionOptions])

  const handleAreaChange = useCallback(
    (event) => {
      const { value } = event.target
      clearFeedback()
      setConflictError('')
      const newData = { ...formData, idArea: value }
      if (value) {
        if (parentType === 'departamento' && formData.idDepartamento) {
          const dept = rawDepartamentos.find(
            (d) => String(d.id ?? d.idDepartamento) === formData.idDepartamento,
          )
          if (dept?.idArea != null && String(dept.idArea) !== value) {
            newData.idDepartamento = ''
            setConflictError(
              'El departamento seleccionado no pertenece al área elegida. Seleccione un departamento válido.',
            )
          }
        }
        if (parentType === 'seccion' && formData.idSeccion) {
          const sec = rawSecciones.find(
            (s) => String(s.id ?? s.idSeccion) === formData.idSeccion,
          )
          if (sec?.idArea != null && String(sec.idArea) !== value) {
            newData.idSeccion = ''
            setConflictError(
              'La sección seleccionada no pertenece al área elegida. Seleccione una sección válida.',
            )
          }
        }
      }
      setFormData(newData)
    },
    [clearFeedback, formData, setFormData, parentType, rawDepartamentos, rawSecciones],
  )

  const handleFieldChange = useCallback(
    (event) => {
      if (event.target.name === 'idArea') {
        handleAreaChange(event)
      } else {
        handleInputChange(event)
      }
    },
    [handleAreaChange, handleInputChange],
  )

  const handleParentTypeChange = useCallback(
    (event) => {
      const { value } = event.target
      clearFeedback()
      setConflictError('')
      setParentType(value)
      setFormData((prev) => ({
        ...prev,
        idDepartamento: value === 'departamento' ? prev.idDepartamento : '',
        idSeccion: value === 'seccion' ? prev.idSeccion : '',
      }))
    },
    [clearFeedback, setFormData, setParentType],
  )

  return {
    filteredDepartmentOptions,
    filteredSectionOptions,
    handleFieldChange,
    handleParentTypeChange,
    conflictError,
    clearConflictError,
  }
}
