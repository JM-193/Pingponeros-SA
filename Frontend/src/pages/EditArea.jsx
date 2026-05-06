import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { actualizarArea, obtenerAreaPorNombre, obtenerAreas } from '../services/areaService'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FormContainer from '../components/FormContainer'
import FormInput from '../components/FormInput'
import FormButton from '../components/FormButton'
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
      // Si el nombre cambió, verificar que no exista otro área con ese nombre
      if (formData.nombre.trim().toLowerCase() !== nombreOriginal.toLowerCase()) {
        const areasExistentes = await obtenerAreas()
        const nombreNormalizadoNuevo = formData.nombre.trim().toLowerCase()
        const nombreDuplicado = areasExistentes.some(
          (area) => area.nombre.toLowerCase() === nombreNormalizadoNuevo && area.nombre.toLowerCase() !== nombreOriginal.toLowerCase()
        )

        if (nombreDuplicado) {
          setErrorMsg('Ya existe un área con este nombre')
          setLoading(false)
          return
        }
      }

      // Actualizar el área con los datos parseados
      await actualizarArea(nombreOriginal, {
        nombre: formData.nombre.trim().toLowerCase(),
        descripcion: formData.descripcion.trim(),
      })

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
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '20px' }}>
            <label
              htmlFor="nombre"
              style={{
                display: 'block',
                fontWeight: 600,
                color: COLORS.labelColor,
                fontSize: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              Área de
            </label>
            <div style={{ flex: 1 }}>
              <FormInput
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
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
            <FormButton label={loading ? 'Guardando...' : 'Actualizar Área'} type="submit" variant="primary" disabled={loading} />
          </div>
        </FormContainer>
      </main>

      <Footer />
    </div>
  )
}
