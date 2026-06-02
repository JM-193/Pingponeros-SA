import PropTypes from 'prop-types'
import { FaPencilAlt } from 'react-icons/fa'
import { COLORS } from '../constants/colors'

const getCellAlign = (align) => align ?? 'left'

export default function EntityResultsTable({
  columns,
  rows,
  onEdit,
  getRowId,
}) {
  const hasActions = Boolean(onEdit)

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
                    width: '10%',
                    whiteSpace: 'nowrap'
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
                        whiteSpace: 'nowrap'
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
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func,
  getRowId: PropTypes.func.isRequired,
}

EntityResultsTable.defaultProps = {
  onEdit: null,
}
