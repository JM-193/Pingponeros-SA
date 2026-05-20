import PropTypes from 'prop-types'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import { COLORS } from '../constants/colors'

const getCellAlign = (align) => align ?? 'left'

export default function EntityResultsTable({
  columns,
  rows,
  onEdit,
  onDelete,
  getRowId,
  isRowInactive,
}) {
  const hasActions = Boolean(onEdit || onDelete)

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
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: '12px 16px',
                    textAlign: getCellAlign(column.align),
                    fontWeight: 600,
                    borderBottom: `1px solid ${COLORS.borderColor}`,
                    width: column.width,
                  }}
                >
                  {column.label}
                </th>
              ))}
              {hasActions && (
                <th
                  style={{
                    padding: '12px 32px',
                    textAlign: 'right',
                    fontWeight: 600,
                    borderBottom: `1px solid ${COLORS.borderColor}`,
                  }}
                />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowId = getRowId(row)
              const inactive = isRowInactive?.(row)

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
                      }}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {hasActions && (
                    <td style={{ padding: '12px 32px', textAlign: 'center', width: '1%', whiteSpace: 'nowrap' }}>
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
                        {onDelete && (
                          <button
                            onClick={() => !inactive && onDelete(row)}
                            aria-label="Eliminar"
                            title={inactive ? 'Inactivo' : 'Eliminar'}
                            disabled={inactive}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 12px',
                              backgroundColor: inactive ? COLORS.disabledBg : COLORS.secondaryBtn,
                              color: inactive ? COLORS.disabledColor : COLORS.white,
                              border: 'none',
                              borderRadius: '4px',
                              cursor: inactive ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) =>
                              !inactive && (e.currentTarget.style.backgroundColor = COLORS.secondaryBtnHover)
                            }
                            onMouseLeave={(e) =>
                              !inactive && (e.currentTarget.style.backgroundColor = COLORS.secondaryBtn)
                            }
                          >
                            <FaTrashAlt size={14} aria-hidden="true" focusable="false" />
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
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  getRowId: PropTypes.func.isRequired,
  isRowInactive: PropTypes.func,
}

EntityResultsTable.defaultProps = {
  onEdit: null,
  onDelete: null,
  isRowInactive: null,
}
