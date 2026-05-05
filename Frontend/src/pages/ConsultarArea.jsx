import { useState } from 'react'
import PropTypes from 'prop-types'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { COLORS } from '../constants/colors'

// Component to show when there are no results
function EmptyResults({ searchTerm }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.inputBg,
        padding: '32px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
        No se encontraron áreas que coincidan con "{searchTerm}"
      </p>
    </div>
  )
}

EmptyResults.propTypes = {
  searchTerm: PropTypes.string.isRequired,
}

// Component to display the results table
function ResultsTable({ currentResults }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.inputBg,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: COLORS.primaryBtn, color: '#fff' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                ID
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                Nombre
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                Descripción
              </th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((area, index) => (
              <tr
                key={area.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                  borderBottom: `1px solid ${COLORS.borderColor}`,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#fff')
                }
              >
                <td style={{ padding: '12px 16px', color: '#666' }}>{area.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#333' }}>{area.nombre}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{area.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

ResultsTable.propTypes = {
  currentResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string.isRequired,
    })
  ).isRequired,
}

// Component to display pagination controls
function PaginationControls({ currentPage, totalPages, handlePageChange }) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          backgroundColor: currentPage === 1 ? COLORS.disabledBg : COLORS.primaryBtn,
          color: currentPage === 1 ? COLORS.disabledColor : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => currentPage > 1 && (e.target.style.backgroundColor = COLORS.primaryBtnHover)}
        onMouseLeave={(e) => currentPage > 1 && (e.target.style.backgroundColor = COLORS.primaryBtn)}
      >
        Anterior
      </button>

      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{
              padding: '8px 12px',
              backgroundColor: page === currentPage ? COLORS.primaryBtn : '#e0e0e0',
              color: page === currentPage ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: page === currentPage ? 600 : 400,
              minWidth: '36px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => page !== currentPage && (e.target.style.backgroundColor = '#d0d0d0')}
            onMouseLeave={(e) => page !== currentPage && (e.target.style.backgroundColor = '#e0e0e0')}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          backgroundColor: currentPage === totalPages ? COLORS.disabledBg : COLORS.primaryBtn,
          color: currentPage === totalPages ? COLORS.disabledColor : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => currentPage < totalPages && (e.target.style.backgroundColor = COLORS.primaryBtnHover)}
        onMouseLeave={(e) => currentPage < totalPages && (e.target.style.backgroundColor = COLORS.primaryBtn)}
      >
        Siguiente
      </button>
    </div>
  )
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
}

export default function ConsultarArea() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const resultsPerPage = 10

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setHasSearched(false)
    setCurrentPage(1)
  }

  const matchesSearch = (area, term) => {
    const lowerTerm = term.toLowerCase()
    return area.nombre.toLowerCase().includes(lowerTerm) || area.descripcion.toLowerCase().includes(lowerTerm)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      alert('Por favor ingrese un término de búsqueda')
      return
    }

    setLoading(true)
    setCurrentPage(1)
    setHasSearched(true)

    try {
      const mockResults = [
        { id: 1, nombre: 'Área de Tecnología', descripcion: 'Departamento encargado de sistemas y TI' },
        { id: 2, nombre: 'Área de Recursos Humanos', descripcion: 'Gestión de personal y nómina' },
        { id: 3, nombre: 'Área de Finanzas', descripcion: 'Contabilidad y análisis financiero' },
        { id: 4, nombre: 'Área de Marketing', descripcion: 'Estrategias de comunicación y branding' },
        { id: 5, nombre: 'Área de Operaciones', descripcion: 'Gestión de procesos operacionales' },
        { id: 6, nombre: 'Área de Ventas', descripcion: 'Estrategia comercial y relaciones con clientes' },
        { id: 7, nombre: 'Área de Logística', descripcion: 'Distribución y gestión de inventario' },
        { id: 8, nombre: 'Área de Calidad', descripcion: 'Control y aseguramiento de calidad' },
        { id: 9, nombre: 'Área de Investigación', descripcion: 'Desarrollo e innovación de productos' },
        { id: 10, nombre: 'Área de Servicio al Cliente', descripcion: 'Atención y soporte al cliente' },
        { id: 11, nombre: 'Área de Seguridad', descripcion: 'Seguridad física y protección de datos' },
        { id: 12, nombre: 'Área de Administración', descripcion: 'Gestión administrativa y trámites' },
      ]

      const filtered = mockResults.filter((area) => matchesSearch(area, searchTerm))
      setResults(filtered)
    } catch (error) {
      console.error('Error al buscar:', error)
      alert('Error al realizar la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(results.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentResults = results.slice(startIndex, endIndex)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' })
    }
  }

  const renderResultsContent = () => {
    if (!hasSearched) return null
    if (results.length === 0) return <EmptyResults searchTerm={searchTerm} />

    return (
      <>
        <ResultsTable currentResults={currentResults} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Mostrando {startIndex + 1} a {Math.min(endIndex, results.length)} de {results.length} resultados
          </p>
          <PaginationControls currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />
        </div>
      </>
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
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              fontWeight: 900,
              fontSize: 'clamp(22px, 2.5vw, 34px)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0 0 10px',
              color: COLORS.labelColor,
            }}
          >
            Consultar Áreas
          </h1>
          <h2
            style={{
              fontWeight: 800,
              fontSize: 'clamp(14px, 1.8vw, 22px)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
              color: COLORS.labelColor,
            }}
          >
            Buscar y Filtrar
          </h2>
        </div>

        <div
          style={{
            backgroundColor: COLORS.inputBg,
            padding: '32px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '32px',
          }}
        >
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="search"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: COLORS.labelColor,
                    fontSize: '14px',
                  }}
                >
                  Buscar por nombre o descripción
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre o descripción del área"
                  style={{
                    width: '100%',
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
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 32px',
                  backgroundColor: loading ? COLORS.disabledBg : COLORS.primaryBtn,
                  color: loading ? COLORS.disabledColor : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = COLORS.primaryBtnHover)}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = COLORS.primaryBtn)}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>
        </div>

        <div id="results-section">{renderResultsContent()}</div>
      </main>

      <Footer />
    </div>
  )
}
