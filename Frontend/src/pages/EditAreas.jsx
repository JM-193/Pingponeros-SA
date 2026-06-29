import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { actualizarArea, obtenerAreaPorNombre } from '../services/areaService'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import StateToggle from '../components/StateToggle'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormErrors, getOrganizationEntityPayload } from '../utils/organizationEntityForm'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

export default function EditAreas({ isOpen, onSuccess, onClose, entityName }) {
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const nombre = entityName
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 1,
  })
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const cargarArea = async () => {
      setIsLoading(true)
      try {
        const area = await obtenerAreaPorNombre(nombre)
        setFormData({
          nombre: area.nombre,
          descripcion: area.descripcion,
          estado: area.estado ?? 1,
        })
        setNombreOriginal(area.nombre)
      } catch (err) {
        notifyApiError(err)
        callbackTimeoutRef.current = setTimeout(() => onClose(), 2000)
      } finally {
        setIsLoading(false)
      }
    }

    if (nombre) {
      cargarArea()
    }
  }, [nombre, onClose])

  const clearFeedback = () => {
    setErrors({})
  }

  const handleInputChange = createOrganizationEntityInputChangeHandler(setFormData, clearFeedback)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const validationErrors = getOrganizationEntityFormErrors(formData, {
      entityLabel: 'área',
      nameArticle: 'del',
    })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      await actualizarArea(nombreOriginal, getOrganizationEntityPayload(formData, { includeEstado: true }))

      notifySuccess('Área actualizada correctamente')
      callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStateChange = (newState) => {
    setFormData((prev) => ({ ...prev, estado: newState }))
    clearFeedback()
  }

  const handleCancel = () => {
    onClose()
  }

  const formFields = (
    <>
      <OrganizationEntityFormFields
        formData={formData}
        onChange={handleInputChange}
        errors={errors}
        namePrefix="Área de"
        namePlaceholder="Nombre del área"
        descriptionPlaceholder="Ingrese la descripción del área"
        nameLabel="Nombre del Área"
        descriptionLabel="Descripción del Área"
      />
      <StateToggle
        currentState={formData.estado}
        onStateChange={handleStateChange}
        disabled={isSubmitting}
      />
    </>
  )

  const formBody = isLoading && !formData.nombre
    ? <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando área...</p>
    : formFields

  return (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Editar Área"
      onSubmit={handleSubmit}
      onClose={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Actualizar"
    >
      {formBody}
    </OrganizationEntityFormModal>
  )
}

EditAreas.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  entityName: PropTypes.string.isRequired,
}

EditAreas.defaultProps = {
  isOpen: false,
}
