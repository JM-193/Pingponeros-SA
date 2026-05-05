import { useState } from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormRow from '../components/FormRow'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import FormButton from '../components/FormButton'
import { COLORS } from '../constants/colors'

export default function CreateUser() {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    firstName_surname: '',
    secondName_surname: '',
    email: '',
    plazaId: '',
    jobPosition: '',
    occupationalClass: '',
  })

  // Manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Datos del formulario:', formData)
  }

  // Manejar limpiar formulario
  const handleReset = () => {
    setFormData({
      firstName: '',
      secondName: '',
      firstName_surname: '',
      secondName_surname: '',
      email: '',
      plazaId: '',
      jobPosition: '',
      occupationalClass: '',
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
          title="Crear Usuario"
          subtitle="Formulario de Registro"
        >
          {/* Fila 1: Primer nombre y Segundo nombre */}
          <FormRow columns={2}>
            <FormInput
              label="Primer Nombre"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Segundo Nombre"
              id="secondName"
              name="secondName"
              value={formData.secondName}
              onChange={handleInputChange}
            />
          </FormRow>

          {/* Fila 2: Primer apellido y Segundo apellido */}
          <FormRow columns={2}>
            <FormInput
              label="Primer Apellido"
              id="firstName_surname"
              name="firstName_surname"
              value={formData.firstName_surname}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Segundo Apellido"
              id="secondName_surname"
              name="secondName_surname"
              value={formData.secondName_surname}
              onChange={handleInputChange}
              required
            />
          </FormRow>

          {/* Correo institucional */}
          <FormInput
            label="Correo Institucional"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          {/* Plaza */}
          <FormSelect
            label="Número de Plaza"
            id="plazaId"
            name="plazaId"
            value={formData.plazaId}
            onChange={handleInputChange}
            options={[]} 
            defaultLabel="Seleccione una plaza"
            required
          />

          {/* Puesto de trabajo */}
          <FormInput
            label="Puesto de Trabajo"
            id="jobPosition"
            name="jobPosition"
            value={formData.jobPosition}
            onChange={handleInputChange}
            disabled={true}
            required
          />

          {/* Clase ocupacional */}
          <FormInput
            label="Clase Ocupacional"
            id="occupationalClass"
            name="occupationalClass"
            value={formData.occupationalClass}
            onChange={handleInputChange}
            required
            style={{ marginBottom: '28px' }}
          />

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <FormButton label="Crear Usuario" type="submit" variant="primary" />
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
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtnHover)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtn)}
            >
              Limpiar
            </button>
          </div>
        </FormContainer>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
