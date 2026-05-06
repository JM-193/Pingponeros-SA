import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearArea } from '../services/areaService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormButton from '../components/FormButton'
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

  // Manage changes in the fields
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSuccessMsg('')
    setErrorMsg('')
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manage form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      setErrorMsg('El nombre del área es requerido')
      setLoading(false)
      return
    }

    // Validar que la descripción no esté vacía
    if (!formData.descripcion.trim()) {
      setErrorMsg('La descripción es requerida')
      setLoading(false)
      return
    }

    try {
      await crearArea({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      })

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
          {/* Nombre con prefijo "Área de" inline */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="nombre"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: COLORS.labelColor,
                fontSize: '14px',
              }}
            >
              Nombre *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: COLORS.labelColor, fontSize: '14px', whiteSpace: 'nowrap' }}>
                Área de
              </span>
              <input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Nombre del área"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.inputBg,
                  color: '#000',
                }}
              />
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="descripcion"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: COLORS.labelColor,
                fontSize: '14px',
              }}
            >
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: COLORS.inputBg,
                color: '#000',
                fontFamily: 'inherit',
                minHeight: '100px',
                resize: 'vertical',
              }}
              placeholder="Ingrese la descripción del área"
            />
          </div>

          {/* Mensajes de feedback */}
          {successMsg && (
            <div style={{ color: '#1b5e20', backgroundColor: '#e8f5e9', padding: '12px 16px', borderRadius: '6px', border: '1px solid #a5d6a7', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>&#10003;</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b71c1c', backgroundColor: '#ffebee', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ef9a9a', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
              <span>&#9888;</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/organizacion/areas/consultar')}
              disabled={loading}
              style={{
                padding: '12px 32px',
                backgroundColor: loading ? COLORS.disabledBg : COLORS.secondaryBtn,
                color: loading ? COLORS.disabledColor : '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#555')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = COLORS.secondaryBtn)}
            >
              Regresar
            </button>
            <FormButton label={loading ? 'Guardando...' : 'Crear Área'} type="submit" variant="primary" disabled={loading} />
          </div>
        </FormContainer>
      </main>

      <Footer />
    </div>
  )
}
