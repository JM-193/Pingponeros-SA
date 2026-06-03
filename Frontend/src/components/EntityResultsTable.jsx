import PropTypes from 'prop-types'
import { FaPencilAlt, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa'
import { COLORS } from '../constants/colors'
import { useMediaQuery } from '../hooks/useMediaQuery'

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

  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile view for the table
  if (isMobile) {
    return (
      <div style={{ marginBottom: '24px' }}>
        {rows.map((row) => {
          const rowId = getRowId(row)
          return (
            <div
              key={rowId}
              style={{
                backgroundColor: COLORS.inputBg,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '16px',
                marginBottom: '12px',
                border: `1px solid ${COLORS.borderColor}`,
              }}
            >
              {columns.map((column, i) => (
                <div
                  key={column.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '8px 0',
                    borderBottom:
                      i < columns.length - 1
                        ? `1px solid ${COLORS.borderColor}`
                        : 'none',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      color: COLORS.textSubtle,
                      flexShrink: 0,
                      minWidth: '90px',
                    }}
                  >
                    {column.label}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: COLORS.textDark,
                      textAlign: 'right',
                      wordBreak: 'break-word',
                    }}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </span>
                </div>
              ))}

              {hasActions && onEdit && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
                  <button
                    onClick={() => onEdit(row)}
                    aria-label="Editar"
                    title="Editar"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 16px',
                      backgroundColor: COLORS.primaryBtn,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      gap: '6px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryBtnHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryBtn)}
                  >
                    <FaPencilAlt size={14} aria-hidden="true" focusable="false" />
                    Editar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

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
                const sortIcon = sortConfig?.direction === 'asc' ? 'ascending' : 'descending'

                return (
                  <th
                    key={column.key}
                    aria-sort={isSorted ? sortIcon : 'none'}
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
