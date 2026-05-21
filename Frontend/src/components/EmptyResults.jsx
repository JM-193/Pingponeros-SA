import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

export default function EmptyResults({ searchTerm, entityLabel }) {
  const trimmedTerm = searchTerm?.trim()
  const hasTerm = Boolean(trimmedTerm)

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
        {hasTerm
          ? `No se encontraron ${entityLabel} que coincidan con "${trimmedTerm}"`
          : `No se encontraron ${entityLabel} disponibles.`}
      </p>
    </div>
  )
}

EmptyResults.propTypes = {
  searchTerm: PropTypes.string,
  entityLabel: PropTypes.string.isRequired,
}

EmptyResults.defaultProps = {
  searchTerm: '',
}
