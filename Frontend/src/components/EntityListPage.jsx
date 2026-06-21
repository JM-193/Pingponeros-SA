import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import FormButton from './FormButton'
import PageLayout from './PageLayout'
import PageTitle from './PageTitle'
import EmptyResults from './EmptyResults'
import PaginationControls from './PaginationControls'
import EntityResultsTable from './EntityResultsTable'
import { COLORS } from '../constants/colors'
import { notifyApiError } from '../utils/notify'

const defaultSearch = (item, term) => {
  const lowerTerm = term.toLowerCase()
  return (
    item.nombre.toLowerCase().includes(lowerTerm) ||
    item.descripcion.toLowerCase().includes(lowerTerm)
  )
}

const sortCollator = new Intl.Collator('es', {
  numeric: true,
  sensitivity: 'base',
})

const getColumnSortValue = (column, row) => {
  if (column.sortValue) return column.sortValue(row)

  const renderedValue = column.render?.(row)
  if (['string', 'number', 'boolean'].includes(typeof renderedValue)) {
    return renderedValue
  }

  return row[column.key]
}

const compareSortValues = (leftValue, rightValue) => {
  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue
  }

  return sortCollator.compare(String(leftValue), String(rightValue))
}

const sortRowsByColumn = (rows, columns, sortConfig) => {
  if (!sortConfig?.key) return rows

  const column = columns.find((currentColumn) => currentColumn.key === sortConfig.key)
  if (!column) return rows

  const direction = sortConfig.direction === 'desc' ? -1 : 1

  return [...rows].sort((leftRow, rightRow) => {
    const leftValue = getColumnSortValue(column, leftRow)
    const rightValue = getColumnSortValue(column, rightRow)
    const isLeftEmpty = leftValue === null || leftValue === undefined || leftValue === ''
    const isRightEmpty = rightValue === null || rightValue === undefined || rightValue === ''

    if (isLeftEmpty && isRightEmpty) return 0
    if (isLeftEmpty) return 1
    if (isRightEmpty) return -1

    return compareSortValues(leftValue, rightValue) * direction
  })
}

export default function EntityListPage({
  title,
  entityLabel,
  createPath,
  editPath,
  renderCreateModal,
  renderEditModal,
  fetchItems,
  columns,
  matchesSearch,
  getRowId,
  searchPlaceholder = 'Ingrese el nombre o descripción',
  resultsPerPage = 10,
}) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const matches = matchesSearch ?? defaultSearch
  const resolveRowId = useMemo(() => getRowId ?? ((item) => item.id), [getRowId])
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return allItems
    }

    return allItems.filter((item) => matches(item, searchTerm))
  }, [allItems, matches, searchTerm])

  const sortedResults = useMemo(
    () => sortRowsByColumn(filteredResults, columns, sortConfig),
    [filteredResults, columns, sortConfig]
  )

  const loadItems = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchItems()
      setAllItems(data)
      setSearchTerm('')
      setCurrentPage(1)
    } catch (error) {
      notifyApiError(error)
    } finally {
      setLoading(false)
    }
  }, [fetchItems])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleEdit = (item) => {
    if (renderEditModal) {
      setEditingItem(item)
      setEditModalOpen(true)
    } else if (editPath) {
      navigate(editPath(item))
    }
  }

  const handleCreateClick = () => {
    if (renderCreateModal) {
      setCreateModalOpen(true)
    } else if (createPath) {
      navigate(createPath)
    }
  }

  const handleModalSuccess = useCallback(async () => {
    setCreateModalOpen(false)
    setEditModalOpen(false)
    setEditingItem(null)

    await loadItems()
  }, [loadItems])

  const handleSort = (columnKey) => {
    setSortConfig((currentSort) => ({
      key: columnKey,
      direction: currentSort?.key === columnKey && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(sortedResults.length / resultsPerPage)
  const hasResults = sortedResults.length > 0
  const startIndex = hasResults ? (currentPage - 1) * resultsPerPage : 0
  const endIndex = hasResults ? startIndex + resultsPerPage : 0
  const currentResults = hasResults ? sortedResults.slice(startIndex, endIndex) : []

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
          onEdit={(editPath || renderEditModal) ? handleEdit : undefined}
          getRowId={resolveRowId}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        {hasResults ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ margin: 0, color: COLORS.textSubtle, fontSize: '14px' }}>
              Mostrando {startIndex + 1} a {Math.min(endIndex, sortedResults.length)} de {sortedResults.length} resultados
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
        <form onSubmit={(e) => e.preventDefault()}>
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
              onClick={handleCreateClick}
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
        <FormButton
          label="Regresar"
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          disabled={loading}
        />
      </div>

      {renderCreateModal?.({
        isModal: true,
        isOpen: createModalOpen,
        onClose: () => setCreateModalOpen(false),
        onSuccess: handleModalSuccess,
      })}
      {renderEditModal?.({
        isModal: true,
        isOpen: editModalOpen,
        onClose: () => { setEditModalOpen(false); setEditingItem(null) },
        onSuccess: handleModalSuccess,
        item: editingItem,
      })}
    </PageLayout>
  )
}

EntityListPage.propTypes = {
  title: PropTypes.string.isRequired,
  entityLabel: PropTypes.string.isRequired,
  createPath: PropTypes.string,
  editPath: PropTypes.func,
  renderCreateModal: PropTypes.func,
  renderEditModal: PropTypes.func,
  fetchItems: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortValue: PropTypes.func,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.string,
    })
  ).isRequired,
  matchesSearch: PropTypes.func,
  getRowId: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  resultsPerPage: PropTypes.number,
}

EntityListPage.defaultProps = {
  createPath: null,
  editPath: null,
  renderCreateModal: null,
  renderEditModal: null,
  matchesSearch: null,
  getRowId: null,
}
