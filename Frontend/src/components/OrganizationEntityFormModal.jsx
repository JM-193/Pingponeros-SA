import PropTypes from 'prop-types'
import Modal from './Modal'
import FormContainer from './FormContainer'
import FormButton from './FormButton'

export default function OrganizationEntityFormModal({
  isOpen,
  title,
  onSubmit,
  onClose,
  isBusy,
  primaryLabel,
  primaryLoadingLabel,
  extraActions,
  children,
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <FormContainer
        onSubmit={onSubmit}
        requiredNote
        embedded
      >
        {children}

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
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isBusy: PropTypes.bool,
  primaryLabel: PropTypes.string.isRequired,
  primaryLoadingLabel: PropTypes.string,
  extraActions: PropTypes.node,
  children: PropTypes.node.isRequired,
}

OrganizationEntityFormModal.defaultProps = {
  isBusy: false,
  primaryLoadingLabel: 'Guardando...',
  extraActions: null,
}
