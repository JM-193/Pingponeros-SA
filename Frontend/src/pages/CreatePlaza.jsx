// CreatePlaza.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearPlaza } from '../services/plazaService'
import { obtenerUnidades } from '../services/unidadService'
import { obtenerDepartamentos } from '../services/departamentoService'
import { obtenerSecciones } from '../services/seccionService'
import { obtenerAreas } from '../services/areaService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import StatusMessage from '../components/StatusMessage'
import PageLayout from '../components/PageLayout'
import { buildLabeledOptions, resolveOptionValueKey } from '../utils/organizationOptions'
import { COLORS } from '../constants/colors'

const initialFormData = {
  numeroPlaza: '',
  idUnidad: '',
  idDepartamento: '',
  idSeccion: '',
  idArea: '',
}

const NUMERO_REGEX = /[^0-9]/g

export default function CreatePlaza() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [unidadOptions, setUnidadOptions] = useState([])
  const [departamentoOptions, setDepartamentoOptions] = useState([])
  const [seccionOptions, setSeccionOptions] = useState([])
  const [areaOptions, setAreaOptions] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const cargarOpciones = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [unidades, departamentos, secciones, areas] = await Promise.all([
          obtenerUnidades(),
          obtenerDepartamentos(),
          obtenerSecciones(),
          obtenerAreas(),
        ])

        const unidadKey = resolveOptionValueKey(unidades, ['id', 'idUnidad'])
        const departamentoKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
        const seccionKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])
        const areaKey = resolveOptionValueKey(areas, ['id', 'idArea'])

        setUnidadOptions(buildLabeledOptions(unidades, { valueKey: unidadKey, labelPrefix: 'Unidad de ' }))
        setDepartamentoOptions(buildLabeledOptions(departamentos, { valueKey: departamentoKey, labelPrefix: 'Departamento de ' }))
        setSeccionOptions(buildLabeledOptions(secciones, { valueKey: seccionKey, labelPrefix: 'Sección de ' }))
        setAreaOptions(buildLabeledOptions(areas, { valueKey: areaKey, labelPrefix: 'Área de ' }))
      } catch (err) {
        setLoadError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarOpciones()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSuccessMsg('')
    setErrorMsg('')
    const sanitizedValue = name === 'numeroPlaza' ? value.replace(NUMERO_REGEX, '') : value
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    const numero = Number.parseInt(formData.numeroPlaza, 10)
    if (!formData.numeroPlaza.trim()) {
      setErrorMsg('El número de plaza es obligatorio.')
      return
    }
    if (!Number.isInteger(numero) || numero <= 0) {
      setErrorMsg('El número de plaza debe ser un entero positivo.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        numeroPlaza:    numero,
        idUnidad:       formData.idUnidad       ? Number.parseInt(formData.idUnidad, 10)       : null,
        idDepartamento: formData.idDepartamento ? Number.parseInt(formData.idDepartamento, 10) : null,
        idSeccion:      formData.idSeccion       ? Number.parseInt(formData.idSeccion, 10)      : null,
        idArea:         formData.idArea          ? Number.parseInt(formData.idArea, 10)         : null,
      }
      await crearPlaza(payload)
      setSuccessMsg(`Plaza '${numero}' creada correctamente.`)
      setFormData(initialFormData)
      setTimeout(() => navigate('/organizacion/plazas/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageLayout
        mainStyle={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: COLORS.textSubtle }}>Cargando datos de organización...</p>
      </PageLayout>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>
      <Header />
      <Navbar />
      <main
        style={{
          flex: 1,
          padding: '40px 40px 60px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <FormContainer
          onSubmit={handleSubmit}
          title="Crear Plaza"
          subtitle="Formulario de Registro"
        >
          {loadError && (
            <StatusMessage variant="error" message={`Error al cargar opciones: ${loadError}`} />
          )}

          <FormInput
            label="Número de Plaza"
            id="numeroPlaza"
            name="numeroPlaza"
            type="text"
            inputMode="numeric"
            value={formData.numeroPlaza}
            onChange={handleInputChange}
            required
          />

          <FormSelect
            label="Unidad"
            id="idUnidad"
            name="idUnidad"
            value={formData.idUnidad}
            onChange={handleInputChange}
            options={unidadOptions}
            defaultLabel="-- Sin asignación --"
          />

          <FormSelect
            label="Departamento"
            id="idDepartamento"
            name="idDepartamento"
            value={formData.idDepartamento}
            onChange={handleInputChange}
            options={departamentoOptions}
            defaultLabel="-- Sin asignación --"
          />

          <FormSelect
            label="Sección"
            id="idSeccion"
            name="idSeccion"
            value={formData.idSeccion}
            onChange={handleInputChange}
            options={seccionOptions}
            defaultLabel="-- Sin asignación --"
          />

          <FormSelect
            label="Área"
            id="idArea"
            name="idArea"
            value={formData.idArea}
            onChange={handleInputChange}
            options={areaOptions}
            defaultLabel="-- Sin asignación --"
          />

          {errorMsg && <StatusMessage variant="error" message={errorMsg} />}
          {successMsg && <StatusMessage variant="success" message={successMsg} />}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <FormButton
              label="Regresar"
              type="button"
              variant="secondary"
              onClick={() => navigate('/plazas/consultar')}
              disabled={isSubmitting}
            />
            <FormButton
              label={isSubmitting ? 'Guardando...' : 'Crear'}
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            />
          </div>
        </FormContainer>
      </main>
      <Footer />
    </div>
  )
}
