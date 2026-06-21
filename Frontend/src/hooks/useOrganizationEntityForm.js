import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormErrors,
  getOrganizationEntityPayload,
} from '../utils/organizationEntityForm'
import { notifySuccess, notifyApiError } from '../utils/notify'

export function useOrganizationEntityForm({
  initialFormData,
  loadData,
  loadDeps = [],
  shouldLoad = true,
  onLoadSuccess,
  onLoadError,
  getValidationOptions,
  getPayloadOptions,
  onSubmit,
  successMessage,
  onSuccess,
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(Boolean(loadData))
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Errores de validación por campo: { nombre?, descripcion?, idArea?, ... }
  const [errors, setErrors] = useState({})

  const clearFeedback = useCallback(() => {
    setErrors({})
  }, [])

  const handleInputChange = useMemo(
    () => createOrganizationEntityInputChangeHandler(setFormData, clearFeedback),
    [clearFeedback],
  )

  const resetFormData = useCallback(() => {
    setFormData(initialFormData)
  }, [initialFormData])

  useEffect(() => {
    if (!loadData || !shouldLoad) {
      return
    }

    let isActive = true

    const runLoad = async () => {
      setIsLoading(true)
      try {
        const result = await loadData()
        if (!isActive) return
        if (result?.formData) {
          setFormData(result.formData)
        }
        if (onLoadSuccess) {
          onLoadSuccess(result)
        }
      } catch (err) {
        if (!isActive) return
        notifyApiError(err)
        if (onLoadError) {
          onLoadError(err)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    runLoad()

    return () => {
      isActive = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, shouldLoad, onLoadSuccess, onLoadError, ...loadDeps])

  const resolveOptions = useCallback((value) => {
    if (typeof value === 'function') {
      return value()
    }
    return value ?? {}
  }, [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setIsSubmitting(true)
      setErrors({})

      const validationOptions = resolveOptions(getValidationOptions)
      const validationErrors = getOrganizationEntityFormErrors(formData, validationOptions)

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        setIsSubmitting(false)
        return
      }

      try {
        const payloadOptions = resolveOptions(getPayloadOptions)
        const payload = getOrganizationEntityPayload(formData, payloadOptions)

        await onSubmit(payload, formData)

        if (successMessage) {
          notifySuccess(successMessage)
        }

        if (onSuccess) {
          onSuccess({ resetFormData, setFormData })
        }
      } catch (err) {
        notifyApiError(err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      formData,
      getPayloadOptions,
      getValidationOptions,
      onSubmit,
      onSuccess,
      resolveOptions,
      resetFormData,
      successMessage,
    ],
  )

  return {
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    errors,
    clearFeedback,
    handleInputChange,
    handleSubmit,
    resetFormData,
  }
}
