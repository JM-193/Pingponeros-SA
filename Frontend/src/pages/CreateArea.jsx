import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearArea } from '../services/areaService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormButton from '../components/FormButton'
import OrganizationUnitFormFields from '../components/OrganizationUnitFormFields'
import StatusMessage from '../components/StatusMessage'
import { createOrganizationUnitInputChangeHandler, getOrganizationUnitFormError, getOrganizationUnitPayload } from '../utils/organizationUnitForm'
import { COLORS } from '../constants/colors'

export default function CreateArea() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  })
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

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
      await crearArea(getOrganizationUnitPayload(formData))

      setSuccessMsg('Área creada correctamente')
      handleReset()
      // Redirigir después de 1.5 segundos
      setTimeout(() => navigate('/organizacion/areas/consultar'), 1500)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Manage form reset
  const handleReset = () => {
    setFormData({
      nombre: '',
      descripcion: '',
    })
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
          title="Crear Área"
          subtitle="Formulario de Registro"
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
            <FormButton label={loading ? 'Guardando...' : 'Crear Área'} type="submit" variant="primary" disabled={loading} />
          </div>
        </FormContainer>
      </main>

      <Footer />
    </div>
  )
}
