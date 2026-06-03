import PropTypes from 'prop-types'
import { FaPencilAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa'
import { COLORS } from '../constants/colors'

const getCellAlign = (align) => align ?? 'left'
const getHeaderJustifyContent = (align) => {
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}

const getSortIcon = (isSorted, direction) => {
  if (!isSorted) return <FaSort size={12} aria-hidden="true" focusable="false" />
  if (direction === 'asc') return <FaSortUp size={12} aria-hidden="true" focusable="false" />
  return <FaSortDown size={12} aria-hidden="true" focusable="false" />
}

export default function EntityResultsTable({
  columns,
  rows,
  onEdit,
  getRowId,
  sortConfig,
  onSort,
}) {
  const hasActions = Boolean(onEdit)
  const canSort = Boolean(onSort)

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
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: COLORS.primaryBtn, color: COLORS.white }}>
              {columns.map((column) => {
                const isSorted = sortConfig?.key === column.key
                const nextDirection = isSorted && sortConfig.direction === 'asc' ? 'descendente' : 'ascendente'

                return (
                  <th
                    key={column.key}
                    aria-sort={isSorted ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{
                      padding: '12px 16px',
                      textAlign: getCellAlign(column.align),
                      fontWeight: 600,
                      borderBottom: `1px solid ${COLORS.borderColor}`,
                      width: column.width,
                    }}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(column.key)}
                        aria-label={`Ordenar por ${column.label} ${nextDirection}`}
                        title={`Ordenar ${nextDirection}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: getHeaderJustifyContent(column.align),
                          gap: '6px',
                          width: '100%',
                          minHeight: '20px',
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          color: 'inherit',
                          cursor: 'pointer',
                          font: 'inherit',
                          fontWeight: 600,
                          textAlign: getCellAlign(column.align),
                        }}
                      >
                        <span>{column.label}</span>
                        {getSortIcon(isSorted, sortConfig?.direction)}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                )
              })}
              {hasActions && (
                <th
                  style={{
                    padding: '12px 32px',
                    textAlign: 'right',
                    fontWeight: 600,
                    borderBottom: `1px solid ${COLORS.borderColor}`,
                    width: '10%',
                    whiteSpace: 'nowrap',
                  }}
                />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowId = getRowId(row)

              return (
                <tr
                  key={rowId}
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
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: '12px 16px',
                        textAlign: getCellAlign(column.align),
                        color: COLORS.textDark,
                        wordBreak: 'break-word',
                      }}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {hasActions && (
                    <td
                      style={{
                        padding: '12px 32px',
                        textAlign: 'center',
                        width: '10%',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            aria-label="Editar"
                            title="Editar"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
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
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryBtnHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryBtn)}
                          >
                            <FaPencilAlt size={14} aria-hidden="true" focusable="false" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

EntityResultsTable.propTypes = {
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
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func,
  getRowId: PropTypes.func.isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  onSort: PropTypes.func,
}

EntityResultsTable.defaultProps = {
  onEdit: null,
  sortConfig: null,
  onSort: null,
}
