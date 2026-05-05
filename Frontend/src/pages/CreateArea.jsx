import { useState } from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton'
import { COLORS } from '../constants/colors'

export default function CreateArea() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  })

  // Manage changes in the fields
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manage form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Datos del formulario:', formData)
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
          {/* Nombre */}
          <FormInput
            label="Nombre"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />

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

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <FormButton label="Crear Área" type="submit" variant="primary" />
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '12px 32px',
                backgroundColor: COLORS.secondaryBtn,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#555')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtn)}
            >
              Limpiar
            </button>
          </div>
        </FormContainer>
      </main>

      <Footer />
    </div>
  )
}
