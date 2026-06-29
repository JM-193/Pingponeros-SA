import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Modal from './Modal'
import FormSelect from './FormSelect'
import FormInput from './FormInput'
import FormButton from './FormButton'
import { COLORS } from '../constants/colors'
import { TIPO_FUNCION, TIPO_FUNCION_OPTIONS, PERIODICIDAD_OPTIONS } from '../constants/declaracion'

const NUEVA = '__nueva__'

const EMPTY = {
  tipoFuncion: '',
  funcion: '',
  periodicidad: '',
  vecesRealizadas: '',
  duracion: '',
  nuevaNombre: '',
  nuevaDescripcion: '',
}

const funcionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  nombre: PropTypes.string,
  descripcion: PropTypes.string,
})

export default function DeclarationActivityModal({
  isOpen,
  onClose,
  propias,
  complemento,
  definidas,
  onAgregar,
  onCrearDefinida,
}) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const esDefinida = form.tipoFuncion === TIPO_FUNCION.DEFINIDA
  const esNueva = esDefinida && form.funcion === NUEVA

  const pool = useMemo(() => {
    if (form.tipoFuncion === TIPO_FUNCION.PROPIA) return propias
    if (form.tipoFuncion === TIPO_FUNCION.DEFINIDA) return definidas
    if (form.tipoFuncion === TIPO_FUNCION.OTRO || form.tipoFuncion === TIPO_FUNCION.APOYO) return complemento
    return []
  }, [form.tipoFuncion, propias, complemento, definidas])

  const funcionOptions = useMemo(() => {
    const base = pool.map((f) => ({ value: String(f.id), label: f.nombre }))
    if (esDefinida) base.push({ value: NUEVA, label: '➕ Crear nueva función' })
    return base
  }, [pool, esDefinida])

  const handleClose = () => {
    setForm(EMPTY)
    setErrors({})
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
    setForm((prev) => {
      // Al cambiar de tipo se reinicia la función seleccionada y los campos de "nueva".
      if (name === 'tipoFuncion') {
        return { ...prev, tipoFuncion: value, funcion: '', nuevaNombre: '', nuevaDescripcion: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const validar = () => {
    const next = {}
    if (!form.tipoFuncion) next.tipoFuncion = 'Seleccione el tipo de función'
    if (!form.funcion) next.funcion = 'Seleccione una función'
    if (esNueva) {
      if (!form.nuevaNombre.trim()) next.nuevaNombre = 'El nombre es obligatorio'
      if (!form.nuevaDescripcion.trim()) next.nuevaDescripcion = 'La descripción es obligatoria'
    }
    if (!form.periodicidad) next.periodicidad = 'Seleccione la periodicidad'
    if (!(Number(form.vecesRealizadas) >= 1)) next.vecesRealizadas = 'Debe ser al menos 1'
    if (!(Number(form.duracion) >= 1)) next.duracion = 'Debe ser al menos 1 minuto'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleAgregar = async () => {
    if (!validar()) return
    setSubmitting(true)
    try {
      let idFuncion = null
      let idFuncionPropia = null
      let nombre = ''
      let descripcion = ''

      if (esDefinida) {
        if (esNueva) {
          const creada = await onCrearDefinida(form.nuevaNombre.trim(), form.nuevaDescripcion.trim())
          if (!creada) return
          idFuncionPropia = creada.id
          nombre = creada.nombre
          descripcion = creada.descripcion
        } else {
          const f = definidas.find((x) => String(x.id) === form.funcion)
          if (!f) return
          idFuncionPropia = f.id
          nombre = f.nombre
          descripcion = f.descripcion
        }
      } else {
        const f = pool.find((x) => String(x.id) === form.funcion)
        if (!f) return
        idFuncion = f.id
        nombre = f.nombre
        descripcion = f.descripcion
      }

      onAgregar({
        tempId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        tipoFuncion: form.tipoFuncion,
        idFuncion,
        idFuncionPropia,
        nombre,
        descripcion,
        periodicidad: form.periodicidad,
        vecesRealizadas: Number(form.vecesRealizadas),
        duracion: Number(form.duracion),
      })
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Agregar Función" onClose={handleClose}>
      <FormSelect
        label="Tipo de función"
        id="tipoFuncion"
        name="tipoFuncion"
        value={form.tipoFuncion}
        onChange={handleChange}
        options={TIPO_FUNCION_OPTIONS}
        defaultLabel="Seleccione el tipo"
        required
        error={errors.tipoFuncion}
      />

      {form.tipoFuncion && (
        <FormSelect
          label="Función"
          id="funcion"
          name="funcion"
          value={form.funcion}
          onChange={handleChange}
          options={funcionOptions}
          defaultLabel={funcionOptions.length ? 'Seleccione una función' : 'No hay funciones disponibles'}
          required
          error={errors.funcion}
        />
      )}

      {esNueva && (
        <>
          <FormInput
            label="Nombre de la nueva función"
            id="nuevaNombre"
            name="nuevaNombre"
            value={form.nuevaNombre}
            onChange={handleChange}
            required
            maxLength={100}
            error={errors.nuevaNombre}
          />
          <FormInput
            label="Descripción"
            id="nuevaDescripcion"
            name="nuevaDescripcion"
            value={form.nuevaDescripcion}
            onChange={handleChange}
            required
            maxLength={2048}
            error={errors.nuevaDescripcion}
          />
        </>
      )}

      <FormSelect
        label="Periodicidad"
        id="periodicidad"
        name="periodicidad"
        value={form.periodicidad}
        onChange={handleChange}
        options={PERIODICIDAD_OPTIONS}
        defaultLabel="Seleccione la periodicidad"
        required
        error={errors.periodicidad}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormInput
          label="Cantidad de veces"
          id="vecesRealizadas"
          name="vecesRealizadas"
          type="number"
          value={form.vecesRealizadas}
          onChange={handleChange}
          required
          error={errors.vecesRealizadas}
        />
        <FormInput
          label="Duración (min.)"
          id="duracion"
          name="duracion"
          type="number"
          value={form.duracion}
          onChange={handleChange}
          required
          error={errors.duracion}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        <FormButton label="Cancelar" type="button" variant="secondary" onClick={handleClose} width="auto" />
        <FormButton
          label={submitting ? 'Agregando...' : 'Agregar'}
          type="button"
          variant="primary"
          onClick={handleAgregar}
          disabled={submitting}
          width="auto"
        />
      </div>

      <p style={{ fontSize: '12px', color: COLORS.textSubtle, margin: '12px 0 0' }}>
        Para «De otro puesto» y «De apoyo ocasional» se muestran las funciones que no pertenecen a su puesto.
      </p>
    </Modal>
  )
}

DeclarationActivityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  propias: PropTypes.arrayOf(funcionPropType).isRequired,
  complemento: PropTypes.arrayOf(funcionPropType).isRequired,
  definidas: PropTypes.arrayOf(funcionPropType).isRequired,
  onAgregar: PropTypes.func.isRequired,
  onCrearDefinida: PropTypes.func.isRequired,
}
