import PropTypes from 'prop-types'
import { COLORS } from '../constants/colors'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
  padding: '24px',
  border: 'none',
  margin: 0,
}

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
  maxWidth: '480px',
  width: '100%',
  padding: '24px',
  position: 'relative',
  zIndex: 1,
}

const titleStyle = {
  margin: '0 0 8px',
  fontSize: '18px',
  fontWeight: 700,
  color: COLORS.labelColor,
}

const messageStyle = {
  margin: 0,
  fontSize: '14px',
  color: '#444',
  lineHeight: 1.5,
}

const actionsStyle = {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  flexWrap: 'wrap',
}

const baseButtonStyle = {
  padding: '10px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'background-color 0.2s',
}

const cancelButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: COLORS.disabledBg,
  color: '#333',
}

const confirmButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: COLORS.secondaryBtn,
  color: '#fff',
}

const backdropButtonStyle = {
  position: 'absolute',
  inset: 0,
  border: 'none',
  padding: 0,
  margin: 0,
  background: 'transparent',
  cursor: 'default',
  zIndex: 0,
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  const handleDialogCancel = (event) => {
    event.preventDefault()
    onCancel()
  }

  return (
    <dialog
      open
      style={overlayStyle}
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby={message ? 'confirm-modal-message' : undefined}
      onCancel={handleDialogCancel}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        style={backdropButtonStyle}
        tabIndex={-1}
      />
      <div style={modalStyle}>
        <h2 id="confirm-modal-title" style={titleStyle}>
          {title}
        </h2>
        {message ? (
          <p id="confirm-modal-message" style={messageStyle}>
            {message}
          </p>
        ) : null}
        <div style={actionsStyle}>
          <button
            type="button"
            onClick={onCancel}
            style={cancelButtonStyle}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = '#e0e0e0'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = COLORS.disabledBg
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={confirmButtonStyle}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = COLORS.secondaryBtnHover
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = COLORS.secondaryBtn
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node,
  confirmLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

ConfirmModal.defaultProps = {
  message: null,
}
