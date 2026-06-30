import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import PageLayout from '../components/PageLayout'
import FormSelect from '../components/FormSelect'
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton'
import EntityResultsTable from '../components/EntityResultsTable'
import DeclarationActivityModal from '../components/DeclarationActivityModal'
import { obtenerSesion } from '../services/session'
import {
  obtenerAutocompletado,
  obtenerDeclaracionActiva,
  crearDeclaracion,
  guardarDeclaracion,
  completarDeclaracion,
  cancelarDeclaracion,
} from '../services/declarationService'
import { obtenerFunciones } from '../services/functionService'
import { obtenerFuncionesDePuesto } from '../services/workPositionService'
import {
  obtenerFuncionesUsuarioPorCorreo,
  crearFuncionUsuario,
} from '../services/userFunctionService'
import { notifySuccess, notifyError, notifyApiError } from '../utils/notify'
import { confirmAction, blockingInfo } from '../utils/alerts'
import { hhmmAMinutos, minutosAHHMM, formatearMinutos } from '../utils/tiempo'
import { evaluarCarga } from '../utils/workloadCalc'
import { COLORS } from '../constants/colors'
import { JORNADA_OPTIONS, TIPO_FUNCION } from '../constants/declaracion'
import { TEXTO_SEGURO_REGEX } from '../constants/regex'

const asArray = (v) => (Array.isArray(v) ? v : [])

// Justificaciones: texto libre que bloquea caracteres de inyección SQL (defensa en profundidad).
const CAMPOS_TEXTO_SEGURO = ['permisoJustificacion', 'horaExtraJustificacion']
const CARACTERES_INSEGUROS = /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,:()¿?¡!/%-]/g
const MENSAJE_TEXTO_INSEGURO = 'La justificación contiene caracteres no permitidos.'

const EMPTY_FORM = {
  numeroPlaza: '',
  idPuesto: null,
  cargo: '',
  claseOcupacional: '',
  lugarTrabajo: '',
  jornadaLaboral: '',
  horaEntrada: '',
  horaSalida: '',
  descanso: '',
  actividades: [],
  permisoAplica: false,
  permisoDias: '',
  permisoJustificacion: '',
  permisoConocimiento: false,
  horaExtraAplica: false,
  horaExtraTiempo: '',
  horaExtraJustificacion: '',
  horaExtraConocimiento: false,
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 600,
  color: COLORS.labelColor,
  fontSize: '14px',
}

const cardStyle = {
  maxWidth: '820px',
  margin: '0 auto',
  backgroundColor: COLORS.inputBg,
  padding: '32px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

const stepTitleStyle = {
  fontWeight: 900,
  fontSize: 'clamp(20px, 2.4vw, 30px)',
  textAlign: 'center',
  margin: '0 0 4px',
  color: COLORS.labelColor,
}

const stepSubtitleStyle = {
  textAlign: 'center',
  color: COLORS.textMuted,
  margin: '0 0 24px',
  fontSize: '15px',
}

const cargaPropType = PropTypes.shape({
  totalMin: PropTypes.number,
  baseMin: PropTypes.number,
  ratio: PropTypes.number,
  nivel: PropTypes.string,
})

function SiNoRadio({ name, label, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={labelStyle}>{label}</p>
      <label style={{ marginRight: '20px', fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <input type="radio" name={name} checked={value === true} onChange={() => onChange(true)} disabled={disabled} /> Sí
      </label>
      <label style={{ fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <input type="radio" name={name} checked={value === false} onChange={() => onChange(false)} disabled={disabled} /> No
      </label>
    </div>
  )
}

function TextAreaField({ label, name, value, onChange, error }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={2048}
        rows={3}
        style={{
          width: '100%',
          padding: '10px',
          border: error ? `2px solid ${COLORS.danger}` : `1px solid ${COLORS.borderColor}`,
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />
      {error && <span style={{ fontSize: '12px', color: COLORS.danger, display: 'block', marginTop: '6px' }}>{error}</span>}
    </div>
  )
}

const ACTIVITY_COLUMNS = [
  { key: 'nombre', label: 'Nombre', render: (r) => r.nombre },
  { key: 'descripcion', label: 'Descripción', render: (r) => r.descripcion },
  { key: 'periodicidad', label: 'Periodicidad', render: (r) => r.periodicidad },
  { key: 'vecesRealizadas', label: 'Cantidad de veces', render: (r) => r.vecesRealizadas, align: 'center' },
  { key: 'duracion', label: 'Duración (min.)', render: (r) => r.duracion, align: 'center' },
]

export default function DeclarationForm() {
  const navigate = useNavigate()
  const sesion = obtenerSesion()
  const correo = sesion?.correoInstitucional ?? ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [draftId, setDraftId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [autocompletado, setAutocompletado] = useState([])
  const [propias, setPropias] = useState([])
  const [complemento, setComplemento] = useState([])
  const [definidas, setDefinidas] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  const titular = useMemo(() => {
    const entry = autocompletado.find((p) => String(p.numeroPlaza) === String(form.numeroPlaza))
    if (entry?.titular) return entry.titular
    return [sesion?.primerNombre, sesion?.segundoNombre, sesion?.primerApellido, sesion?.segundoApellido]
      .filter(Boolean)
      .join(' ')
  }, [autocompletado, form.numeroPlaza, sesion])

  const cargarPoolsPuesto = useCallback(async (idPuesto) => {
    if (!idPuesto) {
      setPropias([])
      setComplemento([])
      return
    }
    const [delPuesto, todas] = await Promise.all([obtenerFuncionesDePuesto(idPuesto), obtenerFunciones()])
    const propiasArr = asArray(delPuesto)
    const idsPropias = new Set(propiasArr.map((f) => f.id))
    setPropias(propiasArr)
    setComplemento(asArray(todas).filter((f) => !idsPropias.has(f.id)))
  }, [])

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      if (!correo) return
      setLoading(true)
      try {
        const [datos, activa, misFunciones] = await Promise.all([
          obtenerAutocompletado(correo),
          obtenerDeclaracionActiva(correo),
          obtenerFuncionesUsuarioPorCorreo(correo),
        ])
        if (!activo) return
        const plazas = asArray(datos)
        setAutocompletado(plazas)
        setDefinidas(asArray(misFunciones))

        if (activa?.declaracion) {
          const d = activa
          const numero = String(d.declaracion.numeroPlaza)
          const entry = plazas.find((p) => String(p.numeroPlaza) === numero)
          setDraftId(d.declaracion.id)
          setForm({
            numeroPlaza: numero,
            idPuesto: entry?.idPuesto ?? null,
            cargo: d.cargo ?? entry?.cargo ?? '',
            claseOcupacional: d.claseOcupacional ?? entry?.claseOcupacional ?? '',
            lugarTrabajo: d.lugarTrabajo ?? entry?.lugarTrabajo ?? '',
            jornadaLaboral: d.horario?.jornadaLaboral ?? '',
            horaEntrada: d.horario?.horaEntrada ?? '',
            horaSalida: d.horario?.horaSalida ?? '',
            descanso: d.descanso ? minutosAHHMM(d.descanso.tiempo) : '',
            actividades: asArray(d.actividades).map((a) => ({
              tempId: `act-${a.id}`,
              tipoFuncion: a.tipoFuncion,
              idFuncion: a.idFuncion ?? null,
              idFuncionPropia: a.idFuncionPropia ?? null,
              nombre: a.nombre,
              descripcion: a.descripcion,
              periodicidad: a.periodicidad,
              vecesRealizadas: a.vecesRealizadas,
              duracion: a.duracion,
            })),
            permisoAplica: Boolean(d.permisoAusencia),
            permisoDias: d.permisoAusencia ? String(d.permisoAusencia.dias) : '',
            permisoJustificacion: d.permisoAusencia?.justificacion ?? '',
            permisoConocimiento: d.permisoAusencia?.conocimientoJefatura === 1,
            horaExtraAplica: Boolean(d.horaExtra),
            horaExtraTiempo: d.horaExtra ? String(d.horaExtra.tiempoAdicional) : '',
            horaExtraJustificacion: d.horaExtra?.justificacion ?? '',
            horaExtraConocimiento: d.horaExtra?.conocimientoJefatura === 1,
          })
          if (entry?.idPuesto) await cargarPoolsPuesto(entry.idPuesto)
        }
      } catch (err) {
        if (activo) notifyApiError(err)
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [correo, cargarPoolsPuesto])

  const setField = (name, value) => {
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleInput = (e) => {
    const { name, value } = e.target
    const sanitized = CAMPOS_TEXTO_SEGURO.includes(name) ? value.replace(CARACTERES_INSEGUROS, '') : value
    setField(name, sanitized)
  }

  const handlePlazaChange = async (e) => {
    const numero = e.target.value
    const entry = autocompletado.find((p) => String(p.numeroPlaza) === numero)
    setErrors((prev) => ({ ...prev, numeroPlaza: undefined }))
    setForm((prev) => ({
      ...prev,
      numeroPlaza: numero,
      idPuesto: entry?.idPuesto ?? null,
      cargo: entry?.cargo ?? '',
      claseOcupacional: entry?.claseOcupacional ?? '',
      lugarTrabajo: entry?.lugarTrabajo ?? '',
    }))
    await cargarPoolsPuesto(entry?.idPuesto)
  }

  const buildPayload = useCallback(() => {
    const horario =
      form.jornadaLaboral && form.horaEntrada && form.horaSalida
        ? { horaEntrada: form.horaEntrada, horaSalida: form.horaSalida, jornadaLaboral: form.jornadaLaboral }
        : null

    const tiempoDescanso = form.descanso ? hhmmAMinutos(form.descanso) : null

    const horaExtra =
      form.horaExtraAplica && Number(form.horaExtraTiempo) > 0 && form.horaExtraJustificacion.trim()
        ? {
            tiempoAdicional: Number(form.horaExtraTiempo),
            justificacion: form.horaExtraJustificacion.trim(),
            conocimientoJefatura: form.horaExtraConocimiento,
          }
        : null

    const permisoAusencia =
      form.permisoAplica && Number(form.permisoDias) > 0 && form.permisoJustificacion.trim()
        ? {
            dias: Number(form.permisoDias),
            justificacion: form.permisoJustificacion.trim(),
            conocimientoJefatura: form.permisoConocimiento,
          }
        : null

    const actividades = form.actividades.map((a) => ({
      idFuncion: a.idFuncion ?? null,
      idFuncionPropia: a.idFuncionPropia ?? null,
      tipoFuncion: a.tipoFuncion,
      periodicidad: a.periodicidad,
      vecesRealizadas: Number(a.vecesRealizadas),
      duracion: Number(a.duracion),
    }))

    return { horario, tiempoDescanso, horaExtra, permisoAusencia, actividades }
  }, [form])

  const persist = useCallback(async () => {
    let id = draftId
    if (!id) {
      const res = await crearDeclaracion(correo, Number(form.numeroPlaza))
      id = res.id
      setDraftId(id)
    }
    await guardarDeclaracion(id, buildPayload())
    return id
  }, [draftId, correo, form.numeroPlaza, buildPayload])

  const validarPaso1 = () => {
    const next = {}
    if (!form.numeroPlaza) next.numeroPlaza = 'Seleccione una plaza'
    if (!form.jornadaLaboral) next.jornadaLaboral = 'Seleccione la jornada'
    if (!form.horaEntrada) next.horaEntrada = 'Indique la hora de inicio'
    if (!form.horaSalida) next.horaSalida = 'Indique la hora de fin'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSiguiente = async () => {
    if (step === 1 && !validarPaso1()) return
    if (step === 2 && carga.nivel === 'excede15') {
      await blockingInfo(
        'Carga de trabajo excesiva',
        'La carga total supera 1.5x su jornada semanal. Reduzca las funciones declaradas antes de continuar.',
      )
      return
    }
    setSaving(true)
    try {
      await persist()
      setStep((s) => Math.min(3, s + 1))
    } catch (err) {
      notifyApiError(err)
    } finally {
      setSaving(false)
    }
  }

  const handleRegresar = () => setStep((s) => Math.max(1, s - 1))

  const validarFinal = () => {
    const next = {}
    if (form.actividades.length === 0) next.actividades = 'Agregue al menos una función.'
    if (form.permisoAplica) {
      if (Number(form.permisoDias) <= 0) next.permisoDias = 'Indique los días.'
      if (!form.permisoJustificacion.trim()) {
        next.permisoJustificacion = 'Indique cuál es el permiso o licencia.'
      } else if (!TEXTO_SEGURO_REGEX.test(form.permisoJustificacion)) {
        next.permisoJustificacion = MENSAJE_TEXTO_INSEGURO
      }
    }
    if (form.horaExtraAplica) {
      if (Number(form.horaExtraTiempo) <= 0) next.horaExtraTiempo = 'Indique los minutos.'
      if (!form.horaExtraJustificacion.trim()) {
        next.horaExtraJustificacion = 'Justifique el tiempo adicional.'
      } else if (!TEXTO_SEGURO_REGEX.test(form.horaExtraJustificacion)) {
        next.horaExtraJustificacion = MENSAJE_TEXTO_INSEGURO
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleFinalizar = async () => {
    if (!validarPaso1()) {
      setStep(1)
      return
    }
    if (!validarFinal()) {
      if (errors.actividades || form.actividades.length === 0) setStep(2)
      return
    }
    setSaving(true)
    try {
      const id = await persist()
      await completarDeclaracion(id)
      notifySuccess('Declaración completada correctamente.')
      navigate('/home')
    } catch (err) {
      notifyApiError(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelar = async () => {
    const confirmado = await confirmAction({
      title: '¿Cancelar declaración?',
      text: 'Se eliminará permanentemente lo guardado de esta declaración. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, cancelar',
      cancelLabel: 'No',
    })
    if (!confirmado) return
    setSaving(true)
    try {
      if (draftId) await cancelarDeclaracion(draftId)
      notifySuccess('Declaración cancelada.')
      navigate('/declaraciones')
    } catch (err) {
      notifyApiError(err)
    } finally {
      setSaving(false)
    }
  }

  const handleAgregarActividad = (actividad) => {
    setErrors((prev) => ({ ...prev, actividades: undefined }))
    setForm((prev) => ({ ...prev, actividades: [...prev.actividades, actividad] }))
  }

  const handleEliminarActividad = (row) => {
    setForm((prev) => ({ ...prev, actividades: prev.actividades.filter((a) => a.tempId !== row.tempId) }))
  }

  const handleCrearDefinida = async (nombre, descripcion) => {
    try {
      await crearFuncionUsuario({ correoInstitucional: correo, nombre, descripcion })
      const lista = asArray(await obtenerFuncionesUsuarioPorCorreo(correo))
      setDefinidas(lista)
      const creada = lista.find((f) => f.nombre === nombre && f.descripcion === descripcion)
      if (!creada) {
        notifyError('No se pudo crear la función.')
        return null
      }
      return creada
    } catch (err) {
      notifyApiError(err)
      return null
    }
  }

  const plazaOptions = autocompletado.map((p) => ({
    value: String(p.numeroPlaza),
    label: `Plaza N.º ${p.numeroPlaza}${p.cargo ? ' — ' + p.cargo : ''}`,
  }))

  const carga = useMemo(() => evaluarCarga(form.actividades, form.jornadaLaboral), [form.actividades, form.jornadaLaboral])

  if (loading) {
    return (
      <PageLayout>
        <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando declaración...</p>
      </PageLayout>
    )
  }

  if (autocompletado.length === 0) {
    return (
      <PageLayout>
        <div style={cardStyle}>
          <h1 style={stepTitleStyle}>Cargas de Trabajo</h1>
          <p style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: '16px' }}>
            No tiene plazas asignadas. Solicite a un administrador la asignación de una plaza para poder
            completar una declaración jurada.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <FormButton label="Regresar" type="button" variant="secondary" onClick={() => navigate('/declaraciones')} width="auto" />
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div style={cardStyle}>
        {step === 1 && (
          <StepGeneral
            form={form}
            errors={errors}
            plazaOptions={plazaOptions}
            plazaLocked={Boolean(draftId)}
            onPlazaChange={handlePlazaChange}
            onInput={handleInput}
          />
        )}

        {step === 2 && (
          <StepDiagnostico
            actividades={form.actividades}
            carga={carga}
            jornadaSeleccionada={Boolean(form.jornadaLaboral)}
            error={errors.actividades}
            onAbrirModal={() => setModalOpen(true)}
            onEliminar={handleEliminarActividad}
          />
        )}

        {step === 3 && (
          <StepAdicional form={form} errors={errors} titular={titular} setField={setField} onInput={handleInput} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '28px' }}>
          <FormButton
            label="Cancelar declaración"
            type="button"
            variant="danger"
            onClick={handleCancelar}
            disabled={saving}
            width="auto"
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 1 && (
              <FormButton label="Regresar" type="button" variant="secondary" onClick={handleRegresar} disabled={saving} width="auto" />
            )}
            {step < 3 ? (
              <FormButton
                label={saving ? 'Guardando...' : 'Siguiente'}
                type="button"
                variant="primary"
                onClick={handleSiguiente}
                disabled={saving}
                width="auto"
              />
            ) : (
              <FormButton
                label={saving ? 'Finalizando...' : 'Finalizar Formulario'}
                type="button"
                variant="primary"
                onClick={handleFinalizar}
                disabled={saving}
                width="auto"
              />
            )}
          </div>
        </div>
      </div>

      <DeclarationActivityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        propias={propias}
        complemento={complemento}
        definidas={definidas}
        onAgregar={handleAgregarActividad}
        onCrearDefinida={handleCrearDefinida}
      />
    </PageLayout>
  )
}

function StepGeneral({ form, errors, plazaOptions, plazaLocked, onPlazaChange, onInput }) {
  return (
    <>
      <h1 style={stepTitleStyle}>Cargas de Trabajo</h1>
      <p style={stepSubtitleStyle}>Información General</p>

      <FormSelect
        label="Número de plaza"
        id="numeroPlaza"
        name="numeroPlaza"
        value={form.numeroPlaza}
        onChange={onPlazaChange}
        options={plazaOptions}
        defaultLabel="Seleccione una plaza"
        required
        disabled={plazaLocked}
        error={errors.numeroPlaza}
      />

      <FormInput label="Cargo del puesto" id="cargo" name="cargo" value={form.cargo} onChange={() => {}} disabled />
      <FormInput
        label="Clase Ocupacional"
        id="claseOcupacional"
        name="claseOcupacional"
        value={form.claseOcupacional}
        onChange={() => {}}
        disabled
      />
      <FormInput
        label="Lugar de trabajo"
        id="lugarTrabajo"
        name="lugarTrabajo"
        value={form.lugarTrabajo}
        onChange={() => {}}
        disabled
      />

      <FormSelect
        label="Jornada Laboral (Semanalmente)"
        id="jornadaLaboral"
        name="jornadaLaboral"
        value={form.jornadaLaboral}
        onChange={onInput}
        options={JORNADA_OPTIONS}
        defaultLabel="Seleccione la jornada"
        required
        error={errors.jornadaLaboral}
      />

      <p style={labelStyle}>Horario Laboral</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormInput
          label="Inicio"
          id="horaEntrada"
          name="horaEntrada"
          type="time"
          value={form.horaEntrada}
          onChange={onInput}
          required
          error={errors.horaEntrada}
        />
        <FormInput
          label="Finaliza"
          id="horaSalida"
          name="horaSalida"
          type="time"
          value={form.horaSalida}
          onChange={onInput}
          required
          error={errors.horaSalida}
        />
      </div>
    </>
  )
}

function CargaBanner({ carga }) {
  if (!carga.baseMin) return null

  const palette = {
    ok: { bg: COLORS.successSoftBg, color: COLORS.successStrong, border: COLORS.successSoftBorder },
    excede1: { bg: COLORS.warnSoftBg, color: COLORS.warnStrong, border: COLORS.warnSoftBorder },
    excede15: { bg: COLORS.errorSoftBg, color: COLORS.errorStrong, border: COLORS.errorSoftBorder },
  }[carga.nivel]

  const excede_1x = carga.nivel === 'excede1'
        ? 'La carga supera su jornada semanal (1x).'
        : 'La carga está dentro de su jornada semanal.'

  const mensaje =
    carga.nivel === 'excede15'
      ? 'La carga supera 1.5x su jornada semanal. Revise las funciones declaradas.'
      : excede_1x

  return (
    <div
      style={{
        backgroundColor: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        fontSize: '14px',
      }}
    >
      <strong>{mensaje}</strong>
      <div style={{ marginTop: '4px' }}>
        Total semanal: {formatearMinutos(carga.totalMin)} de {formatearMinutos(carga.baseMin)} ({Math.round(carga.ratio * 100)}%).
      </div>
    </div>
  )
}

function ActividadCategoria({ titulo, actividades, onEliminar }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontWeight: 700, fontSize: '16px', color: COLORS.labelColor, margin: '0 0 12px' }}>{titulo}</h3>
      {actividades.length > 0 ? (
        <EntityResultsTable
          columns={ACTIVITY_COLUMNS}
          rows={actividades}
          onDelete={onEliminar}
          getRowId={(r) => r.tempId}
        />
      ) : (
        <p
          style={{
            color: COLORS.textSubtle,
            backgroundColor: COLORS.surfaceAlt,
            border: `1px solid ${COLORS.borderColor}`,
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            margin: 0,
          }}
        >
          Sin funciones en esta categoría.
        </p>
      )}
    </div>
  )
}

function StepDiagnostico({ actividades, carga, jornadaSeleccionada, error, onAbrirModal, onEliminar }) {
  const porTipo = (tipo) => actividades.filter((a) => a.tipoFuncion === tipo)
  return (
    <>
      <h1 style={stepTitleStyle}>Diagnóstico de la Carga de Trabajo</h1>
      <p style={stepSubtitleStyle}>Diagnóstico de Cargas</p>

      {jornadaSeleccionada ? (
        <CargaBanner carga={carga} />
      ) : (
        <p style={{ fontSize: '13px', color: COLORS.textSubtle, marginBottom: '16px' }}>
          Seleccione la jornada en el paso anterior para evaluar la carga.
        </p>
      )}

      {error && <p style={{ color: COLORS.danger, fontSize: '13px', margin: '0 0 16px' }}>{error}</p>}

      <ActividadCategoria titulo="Propias de mi puesto" actividades={porTipo(TIPO_FUNCION.PROPIA)} onEliminar={onEliminar} />
      <ActividadCategoria titulo="De otro puesto" actividades={porTipo(TIPO_FUNCION.OTRO)} onEliminar={onEliminar} />
      <ActividadCategoria titulo="De apoyo ocasional" actividades={porTipo(TIPO_FUNCION.APOYO)} onEliminar={onEliminar} />
      <ActividadCategoria titulo="Definida por mí" actividades={porTipo(TIPO_FUNCION.DEFINIDA)} onEliminar={onEliminar} />

      <FormButton label="Agregar Función" type="button" variant="outline" onClick={onAbrirModal} width="auto" />
    </>
  )
}

function StepAdicional({ form, errors, titular, setField, onInput }) {
  return (
    <>
      <h1 style={stepTitleStyle}>Cargas de Trabajo</h1>
      <p style={stepSubtitleStyle}>Información Adicional</p>

      <FormInput
        label="Tiempo de descanso (almuerzo, café, etc) total al día. (minutos)"
        id="descanso"
        name="descanso"
        type="number"
        value={form.descanso}
        onChange={onInput}
      />

      <SiNoRadio
        name="permisoAplica"
        label="¿Cuenta con algún permiso o licencia autorizada en horas laborales?"
        value={form.permisoAplica}
        onChange={(v) => setField('permisoAplica', v)}
      />
      {form.permisoAplica && (
        <>
          <FormInput
            label="¿Cuántos días a la semana?"
            id="permisoDias"
            name="permisoDias"
            type="number"
            value={form.permisoDias}
            onChange={onInput}
            error={errors.permisoDias}
          />
          <TextAreaField
            label="¿Cuál es el permiso o licencia?"
            name="permisoJustificacion"
            value={form.permisoJustificacion}
            onChange={onInput}
            error={errors.permisoJustificacion}
          />
          <SiNoRadio
            name="permisoConocimiento"
            label="¿Es de conocimiento de su jefatura inmediata?"
            value={form.permisoConocimiento}
            onChange={(v) => setField('permisoConocimiento', v)}
          />
        </>
      )}

      <SiNoRadio
        name="horaExtraAplica"
        label="¿Debe utilizar tiempo adicional (fuera de su jornada laboral) para desempeñar sus funciones?"
        value={form.horaExtraAplica}
        onChange={(v) => setField('horaExtraAplica', v)}
      />
      {form.horaExtraAplica && (
        <>
          <FormInput
            label="¿Cuánto tiempo a la semana? (minutos)"
            id="horaExtraTiempo"
            name="horaExtraTiempo"
            type="number"
            value={form.horaExtraTiempo}
            onChange={onInput}
            error={errors.horaExtraTiempo}
          />
          <TextAreaField
            label="¿Por qué motivo? (justifique detalladamente)"
            name="horaExtraJustificacion"
            value={form.horaExtraJustificacion}
            onChange={onInput}
            error={errors.horaExtraJustificacion}
          />
          <SiNoRadio
            name="horaExtraConocimiento"
            label="¿Es de conocimiento de su jefatura inmediata?"
            value={form.horaExtraConocimiento}
            onChange={(v) => setField('horaExtraConocimiento', v)}
          />
        </>
      )}

      <div style={{ borderTop: `1px solid ${COLORS.borderColor}`, paddingTop: '16px', marginTop: '8px' }}>
        <p style={{ fontWeight: 700, color: COLORS.labelColor, margin: '0 0 6px' }}>Titular del puesto: {titular}</p>
        <p style={{ color: COLORS.textSubtle, fontSize: '13px', margin: 0 }}>
          La firma y la fecha se completan en el documento PDF generado a partir de esta declaración.
        </p>
      </div>
    </>
  )
}

SiNoRadio.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}
SiNoRadio.defaultProps = { disabled: false }

TextAreaField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
}

CargaBanner.propTypes = {
  carga: cargaPropType.isRequired,
}

ActividadCategoria.propTypes = {
  titulo: PropTypes.string.isRequired,
  actividades: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEliminar: PropTypes.func.isRequired,
}

StepGeneral.propTypes = {
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  plazaOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  plazaLocked: PropTypes.bool.isRequired,
  onPlazaChange: PropTypes.func.isRequired,
  onInput: PropTypes.func.isRequired,
}

StepDiagnostico.propTypes = {
  actividades: PropTypes.arrayOf(PropTypes.object).isRequired,
  carga: cargaPropType.isRequired,
  jornadaSeleccionada: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onAbrirModal: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
}

StepAdicional.propTypes = {
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  titular: PropTypes.string.isRequired,
  setField: PropTypes.func.isRequired,
  onInput: PropTypes.func.isRequired,
}
