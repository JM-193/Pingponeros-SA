import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
  padding: '24px',
  border: 'none',
  margin: 0,
  width: '100vw',
  height: '100vh',
  maxWidth: 'none',
  maxHeight: 'none',
  backgroundColor: 'transparent',
}

const backdropStyle = {
  position: 'absolute',
  inset: 0,
  border: 'none',
  padding: 0,
  margin: 0,
  background: 'rgba(0,0,0,0.45)',
  zIndex: 0,
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: `1px solid ${COLORS.borderColor}`,
}

const titleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 700,
  color: COLORS.labelColor,
}

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: COLORS.textSubtle,
  padding: '4px 8px',
  borderRadius: '4px',
  lineHeight: 1,
}

export default function Modal({ isOpen, title, onClose, children, maxWidth }) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog
      open
      style={overlayStyle}
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={backdropStyle} />
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '10px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          maxWidth,
          width: '100%',
          padding: '24px',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 48px)',
        }}
      >
        <div style={headerStyle}>
          <h2 id="modal-title" style={titleStyle}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={closeButtonStyle}
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </dialog>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
}

Modal.defaultProps = {
  title: '',
  maxWidth: '700px',
}
