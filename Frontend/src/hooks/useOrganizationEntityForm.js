import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createOrganizationEntityInputChangeHandler,
  getOrganizationEntityFormError,
  getOrganizationEntityPayload,
} from '../utils/organizationEntityForm'

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
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const clearFeedback = useCallback(() => {
    setSuccessMsg('')
    setErrorMsg('')
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
      setErrorMsg('')
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
        setErrorMsg(err.message)
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
  }, [loadData, shouldLoad, onLoadSuccess, onLoadError, loadDeps])

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
      clearFeedback()

      const validationOptions = resolveOptions(getValidationOptions)
      const validationError = getOrganizationEntityFormError(formData, validationOptions)

      if (validationError) {
        setErrorMsg(validationError)
        setIsSubmitting(false)
        return
      }

      try {
        const payloadOptions = resolveOptions(getPayloadOptions)
        const payload = getOrganizationEntityPayload(formData, payloadOptions)

        await onSubmit(payload, formData)

        if (successMessage) {
          setSuccessMsg(successMessage)
        }

        if (onSuccess) {
          onSuccess({ resetFormData, setFormData })
        }
      } catch (err) {
        setErrorMsg(err.message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      clearFeedback,
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
    successMsg,
    errorMsg,
    clearFeedback,
    handleInputChange,
    handleSubmit,
    resetFormData,
  }
}
