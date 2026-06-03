import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

export default function PaginationControls({ currentPage, totalPages, handlePageChange }) {
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
