import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDelayedNavigate } from '../hooks/useDelayedNavigate'
import PropTypes from 'prop-types'
import { actualizarArea, obtenerAreaPorNombre } from '../services/areaService'
import OrganizationEntityFormFields from '../components/OrganizationEntityFormFields'
import OrganizationEntityFormPage from '../components/OrganizationEntityFormPage'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import StateToggle from '../components/StateToggle'
import { createOrganizationEntityInputChangeHandler, getOrganizationEntityFormErrors, getOrganizationEntityPayload } from '../utils/organizationEntityForm'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

export default function EditAreas({ isModal, isOpen, onSuccess, onClose, entityName }) {
  const navigate = useNavigate()
  const delayedNavigate = useDelayedNavigate()
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])
  const params = useParams()
  const nombre = entityName ?? params.nombre
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
        if (isModal && onClose) {
          callbackTimeoutRef.current = setTimeout(() => onClose(), 2000)
        } else {
          delayedNavigate('/organizacion/areas/consultar', 2000)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (nombre) {
      cargarArea()
    }
  }, [nombre, navigate, isModal, onClose, delayedNavigate])

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
      if (isModal && onSuccess) {
        callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
      } else {
        delayedNavigate('/organizacion/areas/consultar', 1500)
      }
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
    if (isModal && onClose) {
      onClose()
    } else {
      navigate('/organizacion/areas/consultar')
    }
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

  return isModal ? (
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
  ) : (
    <OrganizationEntityFormPage
      title="Editar Área"
      subtitle="Formulario de Actualización"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isBusy={isSubmitting}
      primaryLabel="Actualizar"
    >
      {formBody}
    </OrganizationEntityFormPage>
  )
}

EditAreas.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityName: PropTypes.string,
}

EditAreas.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityName: null,
}
