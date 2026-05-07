import PropTypes from 'prop-types'

function FormRow({ children, columns }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '20px',
        marginBottom: '20px',
      }}
    >
      {children}
    </div>
  )
}

FormRow.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.number,
}

FormRow.defaultProps = {
  columns: 1,
}

export default FormRow
