import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { crearClaseOcupacional } from '../services/occupationalClassService'
import OrganizationEntityFormModal from '../components/OrganizationEntityFormModal'
import { notifySuccess, notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'
import { SOLO_LETRAS_PUNTUACION_REGEX } from '../constants/regex'

const fieldErrorStyle = { fontSize: '12px', color: COLORS.danger, marginTop: '6px', display: 'block' }

const EMPTY_FORM = { codigo: '', nombre: '' }
const CARACTERES_INVALIDOS_NOMBRE = /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ.,:\s]/g

export default function CreateOccupationalClasses({ isOpen, onSuccess, onClose }) {
  const callbackTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(callbackTimeoutRef.current), [])

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM)
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErrors({})
    const sanitized = name === 'nombre' ? value.replace(CARACTERES_INVALIDOS_NOMBRE, '') : value
    setFormData((prev) => ({ ...prev, [name]: sanitized }))
  }

  const validate = () => {
    const errs = {}
    const codigoStr = formData.codigo.toString().trim()
    if (!codigoStr) {
      errs.codigo = 'El código es requerido'
    } else if (!/^\d+$/.test(codigoStr) || Number(codigoStr) <= 0) {
      errs.codigo = 'El código debe ser un número entero positivo'
    }
    if (!formData.nombre.trim()) {
      errs.nombre = 'El nombre de la clase ocupacional es requerido'
    } else if (!SOLO_LETRAS_PUNTUACION_REGEX.test(formData.nombre)) {
      errs.nombre = 'El nombre solo puede contener letras, números, espacios, puntos, comas y dos puntos'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      await crearClaseOcupacional({
        codigo: Number(formData.codigo),
        nombre: formData.nombre.trim(),
      })
      notifySuccess('Clase ocupacional creada correctamente')
      callbackTimeoutRef.current = setTimeout(() => onSuccess(), 1200)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '10px',
    border: hasError ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderColor}`,
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: COLORS.inputBg,
    color: COLORS.black,
  })

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: COLORS.labelColor,
    fontSize: '14px',
  }

  return (
    <OrganizationEntityFormModal
      isOpen={isOpen}
      title="Crear Clase Ocupacional"
      onSubmit={handleSubmit}
      onClose={onClose}
      isBusy={isSubmitting}
      primaryLabel="Crear"
    >
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="codigo" style={labelStyle}>
          Código{' '}
          <span style={{ color: COLORS.danger }} aria-hidden="true">*</span>
        </label>
        <input
          id="codigo"
          name="codigo"
          type="number"
          min="1"
          value={formData.codigo}
          onChange={handleInputChange}
          required
          placeholder="Ingrese el código de la clase ocupacional"
          aria-invalid={errors.codigo ? 'true' : undefined}
          style={inputStyle(errors.codigo)}
        />
        {errors.codigo && <span style={fieldErrorStyle}>{errors.codigo}</span>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="nombre" style={labelStyle}>
          Nombre{' '}
          <span style={{ color: COLORS.danger }} aria-hidden="true">*</span>
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          placeholder="Ingrese el nombre de la clase ocupacional"
          aria-invalid={errors.nombre ? 'true' : undefined}
          maxLength={100}
          style={inputStyle(errors.nombre)}
        />
        {errors.nombre && <span style={fieldErrorStyle}>{errors.nombre}</span>}
      </div>
    </OrganizationEntityFormModal>
  )
}

CreateOccupationalClasses.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateOccupationalClasses.defaultProps = {
  isOpen: false,
}
