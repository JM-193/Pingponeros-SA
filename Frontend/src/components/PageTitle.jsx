import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

export default function PageTitle({ title }) {
  return (
    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
      <h1
        style={{
          fontWeight: 900,
          fontSize: 'clamp(22px, 2.5vw, 34px)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0,
          color: COLORS.labelColor,
        }}
      >
        {title}
      </h1>
    </div>
  )
}

PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
}
