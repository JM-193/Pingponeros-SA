import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import FormButton from './FormButton'
import StatusMessage from './StatusMessage'
import PageLayout from './PageLayout'
import PageTitle from './PageTitle'
import EmptyResults from './EmptyResults'
import PaginationControls from './PaginationControls'
import EntityResultsTable from './EntityResultsTable'
import { COLORS } from '../constants/colors'

const defaultSearch = (item, term) => {
  const lowerTerm = term.toLowerCase()
  return (
    item.nombre.toLowerCase().includes(lowerTerm) ||
    item.descripcion.toLowerCase().includes(lowerTerm)
  )
}

export default function EntityListPage({
  title,
  entityLabel,
  createPath,
  editPath,
  fetchItems,
  columns,
  matchesSearch,
  getRowId,
  searchPlaceholder = 'Ingrese el nombre o descripción',
  resultsPerPage = 10,
  backPath = '/home',
}) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [allItems, setAllItems] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const matches = matchesSearch ?? defaultSearch
  const resolveRowId = useMemo(() => getRowId ?? ((item) => item.id), [getRowId])

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      setErrorMsg('')
      try {
        const data = await fetchItems()
        setAllItems(data)
        setResults(data)
      } catch (error) {
        setErrorMsg(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [fetchItems])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    const filtered = allItems.filter((item) => matches(item, searchTerm))
    setResults(filtered)
  }

  const handleEdit = (item) => {
    if (editPath) {
      navigate(editPath(item))
    }
  }

  const totalPages = Math.ceil(results.length / resultsPerPage)
  const hasResults = results.length > 0
  const startIndex = hasResults ? (currentPage - 1) * resultsPerPage : 0
  const endIndex = hasResults ? startIndex + resultsPerPage : 0
  const currentResults = hasResults ? results.slice(startIndex, endIndex) : []

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      const resultsSection = document.getElementById('results-section')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const renderResultsContent = () => {
    if (loading) return <p style={{ textAlign: 'center', color: COLORS.textSubtle }}>Cargando {entityLabel}...</p>

    return (
      <>
        <EntityResultsTable
          columns={columns}
          rows={currentResults}
          onEdit={editPath ? handleEdit : undefined}
          getRowId={resolveRowId}
        />
        {hasResults ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ margin: 0, color: COLORS.textSubtle, fontSize: '14px' }}>
              Mostrando {startIndex + 1} a {Math.min(endIndex, results.length)} de {results.length} resultados
            </p>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
        ) : (
          <EmptyResults searchTerm={searchTerm} entityLabel={entityLabel} />
        )}
      </>
    )
  }

  return (
    <PageLayout>
      <PageTitle title={title} />

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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
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
              <div style={{ display: 'flex', width: '100%' }}>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder={searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.borderColor}`,
                    borderRight: 'none',
                    borderRadius: '4px 0 0 4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.inputBg,
                    color: COLORS.black,
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Buscar"
                  title="Buscar"
                  style={{
                    minWidth: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 14px',
                    backgroundColor: loading ? COLORS.disabledBg : COLORS.secondaryBtn,
                    color: loading ? COLORS.disabledColor : COLORS.white,
                    border: `1px solid ${COLORS.borderColor}`,
                    borderLeft: 'none',
                    borderRadius: '0 4px 4px 0',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = COLORS.secondaryBtnHover)}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = COLORS.secondaryBtn)}
                >
                  <FaSearch size={16} aria-hidden="true" focusable="false" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(createPath)}
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

      {errorMsg && (
        <StatusMessage
          variant="error"
          message={errorMsg}
          style={{ marginBottom: '20px' }}
        />
      )}

      <div id="results-section">{renderResultsContent()}</div>
      <div style={{ marginTop: '16px' }}>
        <FormButton
          label="Regresar"
          type="button"
          variant="secondary"
          onClick={() => navigate(backPath)}
          disabled={loading}
        />
      </div>
    </PageLayout>
  )
}

EntityListPage.propTypes = {
  title: PropTypes.string.isRequired,
  entityLabel: PropTypes.string.isRequired,
  createPath: PropTypes.string.isRequired,
  editPath: PropTypes.func,
  fetchItems: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.string,
    })
  ).isRequired,
  matchesSearch: PropTypes.func,
  getRowId: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  resultsPerPage: PropTypes.number,
  backPath: PropTypes.string,
}

EntityListPage.defaultProps = {
  editPath: null,
  matchesSearch: null,
  getRowId: null,
}
