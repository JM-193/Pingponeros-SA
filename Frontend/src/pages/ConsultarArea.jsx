import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ConfirmModal from '../components/ConfirmModal'
import FormButton from '../components/FormButton'
import { obtenerAreas, eliminarArea } from '../services/areaService'
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
      <p style={{ color: COLORS.textSubtle, fontSize: '16px', margin: 0 }}>
        No se encontraron áreas que coincidan con &quot;{searchTerm}&quot;
      </p>
    </div>
  )
}

EmptyResults.propTypes = {
  searchTerm: PropTypes.string.isRequired,
}

// Component to display the results table
function ResultsTable({ currentResults, onEdit, onDelete }) {
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
            <tr style={{ backgroundColor: COLORS.primaryBtn, color: COLORS.white }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                Nombre
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                Descripción
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                {/* Editar */}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, borderBottom: `1px solid ${COLORS.borderColor}` }}>
                {/* Eliminar */}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((area, index) => (
              <tr
                key={area.id}
                style={{
                  backgroundColor: index % 2 === 0 ? COLORS.surfaceAlt : COLORS.white,
                  borderBottom: `1px solid ${COLORS.borderColor}`,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.surfaceHover)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = index % 2 === 0 ? COLORS.surfaceAlt : COLORS.white)
                }
              >
                <td style={{ padding: '12px 16px', fontWeight: 600, color: COLORS.textDark }}>{area.nombre}</td>
                <td style={{ padding: '12px 16px', color: COLORS.textMuted }}>{area.descripcion}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', width: '1%', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => onEdit(area.nombre)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: COLORS.primaryBtn,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.primaryBtnHover)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.primaryBtn)}
                  >
                    Editar
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', width: '1%', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => onDelete(area)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: COLORS.secondaryBtn,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtnHover)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.secondaryBtn)}
                  >
                    Eliminar
                  </button>
                </td>
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
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
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
          color: currentPage === 1 ? COLORS.disabledColor : COLORS.white,
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
              backgroundColor: page === currentPage ? COLORS.primaryBtn : COLORS.surfaceMuted,
              color: page === currentPage ? COLORS.white : COLORS.textDark,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: page === currentPage ? 600 : 400,
              minWidth: '36px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => page !== currentPage && (e.target.style.backgroundColor = COLORS.borderLight)}
            onMouseLeave={(e) => page !== currentPage && (e.target.style.backgroundColor = COLORS.surfaceMuted)}
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
          color: currentPage === totalPages ? COLORS.disabledColor : COLORS.white,
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
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [allAreas, setAllAreas] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [areaToDelete, setAreaToDelete] = useState(null)
  const resultsPerPage = 10

  // Cargar todas las áreas cuando monta el componente
  useEffect(() => {
    const loadAllAreas = async () => {
      setLoading(true)
      try {
        const data = await obtenerAreas()
        setAllAreas(data)
        setResults(data)
      } catch (error) {
        console.error('Error al cargar áreas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllAreas()
  }, [])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const matchesSearch = (area, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return area.nombre.toLowerCase().includes(lowerTerm) || area.descripcion.toLowerCase().includes(lowerTerm)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    const filtered = allAreas.filter((area) => matchesSearch(area, searchTerm))
    setResults(filtered)
  }

  const handleEdit = (nombre) => {
    navigate(`/organizacion/areas/editar/${encodeURIComponent(nombre)}`)
  }

  const handleDeleteClick = (area) => {
    setAreaToDelete(area)
  }

  const closeDeleteModal = () => {
    setAreaToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!areaToDelete) return
    try {
      await eliminarArea(areaToDelete.id)
      const updated = allAreas.filter((a) => a.id !== areaToDelete.id)
      setAllAreas(updated)
      setResults(updated.filter((a) => matchesSearch(a, searchTerm)))
      if (currentPage > Math.ceil(updated.length / resultsPerPage)) {
        setCurrentPage((p) => Math.max(1, p - 1))
      }
    } catch (err) {
      console.error('Error al eliminar:', err)
    } finally {
      closeDeleteModal()
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
    if (loading) return <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando áreas...</p>
    if (results.length === 0) return <EmptyResults searchTerm={searchTerm || 'sin resultados'} />

    return (
      <>
        <ResultsTable currentResults={currentResults} onEdit={handleEdit} onDelete={handleDeleteClick} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ margin: 0, color: COLORS.textSubtle, fontSize: '14px' }}>
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
            Áreas
          </h1>
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
                  Buscar
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
                    color: COLORS.black,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 32px',
                  backgroundColor: loading ? COLORS.disabledBg : COLORS.secondaryBtn,
                  color: loading ? COLORS.disabledColor : COLORS.white,
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = COLORS.secondaryBtnHover)}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = COLORS.secondaryBtn)}
              >
                {loading ? 'Cargando...' : 'Buscar'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/organizacion/areas/crear')}
                style={{
                  padding: '10px 32px',
                  backgroundColor: COLORS.primaryBtn,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.primaryBtnHover)}
                onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.primaryBtn)}
              >
                Crear
              </button>
            </div>
          </form>
        </div>

        <div id="results-section">{renderResultsContent()}</div>
        <div style={{ marginTop: '16px' }}>
          <FormButton label="Regresar" type="button" variant="secondary" onClick={() => navigate('/home')} />
        </div>
      </main>

      <Footer />
      <ConfirmModal
        isOpen={Boolean(areaToDelete)}
        title="Confirmar eliminación"
        message={
          areaToDelete
            ? `¿Seguro que deseas eliminar el área "${areaToDelete.nombre}"?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  )
}
