import PropTypes from 'prop-types'
import Modal from './Modal'
import FormContainer from './FormContainer'
import FormButton from './FormButton'
import StatusMessage from './StatusMessage'

export default function OrganizationEntityFormModal({
  isOpen,
  title,
  subtitle,
  onSubmit,
  onClose,
  isBusy,
  successMsg,
  errorMsg,
  primaryLabel,
  primaryLoadingLabel,
  extraActions,
  children,
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <FormContainer
        onSubmit={onSubmit}
        subtitle={subtitle}
        requiredNote
      >
        {children}

        {successMsg && (
          <StatusMessage
            variant="success"
            message={successMsg}
            style={{ marginBottom: '20px' }}
          />
        )}
        {errorMsg && (
          <StatusMessage
            variant="error"
            message={errorMsg}
            style={{ marginBottom: '20px' }}
          />
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <FormButton
            label="Cancelar"
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isBusy}
          />
          {extraActions}
          <FormButton
            label={isBusy ? primaryLoadingLabel : primaryLabel}
            type="submit"
            variant="primary"
            disabled={isBusy}
          />
        </div>
      </FormContainer>
    </Modal>
  )
}

OrganizationEntityFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isBusy: PropTypes.bool,
  successMsg: PropTypes.string,
  errorMsg: PropTypes.string,
  primaryLabel: PropTypes.string.isRequired,
  primaryLoadingLabel: PropTypes.string,
  extraActions: PropTypes.node,
  children: PropTypes.node.isRequired,
}

OrganizationEntityFormModal.defaultProps = {
  subtitle: '',
  isBusy: false,
  successMsg: '',
  errorMsg: '',
  primaryLoadingLabel: 'Guardando...',
  extraActions: null,
}
