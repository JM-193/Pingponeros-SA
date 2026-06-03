import { useCallback, useMemo, useState } from 'react'
import {
  clearAreaConflicts,
  resolveUnidadDependencyChange,
} from '../utils/organizationHierarchy'

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

      const result = clearAreaConflicts({
        formData: { ...formData, idArea: value },
        areaValue: value,
        rawDepartamentos,
        rawSecciones,
      })

      if (result.conflict) {
        setConflictError(result.conflict)
      }
      setFormData(result.formData)
    },
    [clearFeedback, formData, setFormData, rawDepartamentos, rawSecciones],
  )

  const handleFieldChange = useCallback(
    (event) => {
      if (event.target.name === 'idArea') {
        handleAreaChange(event)
        return
      }

      const { name, value } = event.target
      if (name === 'idDepartamento' || name === 'idSeccion') {
        clearFeedback()
        setConflictError('')
        setFormData((prev) =>
          resolveUnidadDependencyChange({
            formData: prev,
            parentType,
            name,
            value,
            rawDepartamentos,
            rawSecciones,
          }),
        )
        return
      }

      handleInputChange(event)
    },
    [clearFeedback, handleAreaChange, handleInputChange, parentType, rawDepartamentos, rawSecciones, setFormData],
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
