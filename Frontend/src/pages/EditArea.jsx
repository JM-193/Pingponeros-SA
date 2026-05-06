import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { actualizarArea, obtenerAreaPorNombre } from '../services/areaService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormButton from '../components/FormButton'
import OrganizationUnitFormFields from '../components/OrganizationUnitFormFields'
import StatusMessage from '../components/StatusMessage'
import { createOrganizationUnitInputChangeHandler, getOrganizationUnitFormError, getOrganizationUnitPayload } from '../utils/organizationUnitForm'
import { COLORS } from '../constants/colors'

export default function EditArea() {
  const navigate = useNavigate()
  const { nombre } = useParams()
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  })
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Cargar el área al montar el componente
  useEffect(() => {
    const cargarArea = async () => {
      setLoading(true)
      setErrorMsg('')
      try {
        const area = await obtenerAreaPorNombre(nombre)
        setFormData({
          nombre: area.nombre,
          descripcion: area.descripcion,
        })
        setNombreOriginal(area.nombre)
      } catch (err) {
        setErrorMsg(err.message)
        setTimeout(() => navigate('/organizacion/areas/consultar'), 2000)
      } finally {
        setLoading(false)
      }
    }

    if (nombre) {
      cargarArea()
    }
  }, [nombre, navigate])

  const clearFeedback = () => {
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Manage changes in the fields
  const handleInputChange = createOrganizationUnitInputChangeHandler(setFormData, clearFeedback)

  // Manage form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearFeedback()

    const validationError = getOrganizationUnitFormError(formData)
    if (validationError) {
      setErrorMsg(validationError)
      setLoading(false)
      return
    }

    try {
      await actualizarArea(nombreOriginal, getOrganizationUnitPayload(formData))

      setSuccessMsg('Área actualizada correctamente')
      // Redirigir después de 1.5 segundos
      setTimeout(() => navigate('/organizacion/areas/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.nombre) {
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: '#666' }}>Cargando área...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bodyBg }}>
      {/* Header */}
      <Header />

      <Navbar />

      {/* Main content */}
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
          title="Editar Área"
          subtitle="Formulario de Actualización"
        >
          <OrganizationUnitFormFields formData={formData} onChange={handleInputChange} />

          {/* Mensajes de feedback */}
          {successMsg && (
            <StatusMessage
              variant="success"
              message={successMsg}
              style={{ marginBottom: '20px' }}
            />
          )}
          {errorMsg && (
            <StatusMessage
              variant="error"
              message={errorMsg}
              style={{ marginBottom: '20px' }}
            />
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <FormButton
              label="Regresar"
              type="button"
              variant="secondary"
              onClick={() => navigate('/organizacion/areas/consultar')}
              disabled={loading}
            />
            <FormButton label={loading ? 'Guardando...' : 'Actualizar Área'} type="submit" variant="primary" disabled={loading} />
          </div>
        </FormContainer>
      </main>

      <Footer />
    </div>
  )
}
